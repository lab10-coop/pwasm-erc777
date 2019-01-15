use pwasm_std::String;
use pwasm_std::str::from_utf8;
use pwasm_abi::types::{H256, U256, Vec, Address};
use crate::keys::*;

/// panics if the given condition is false
pub fn require(cond: bool, msg: &'static str) {
    if !cond {
        panic!(msg);
    }
}

/// panics if the sender is not equal to the owner of the ERC777 contract
pub fn require_owner() {
    require(pwasm_ethereum::sender() == Address::from(H256::from(&pwasm_ethereum::read(&owner_key()))),
            "Sender needs to be the contract owner");
}

/// writes the given string to sequential blocks at the given location in storage
pub fn write_string(location: &H256, name: &String) {
    let bytes = name.as_bytes();
    let string_length = U256::from(bytes.len() as u64);
    pwasm_ethereum::write(&location, &string_length.into());

    // write chunked u8 values into H256 blocks
    let chunks = bytes.chunks(32);
    let mut idx = 1;
    for c in chunks {
        // initialize to 0
        let mut chunk = [0u8; 32];
        // copy relevant bytes to H256
        chunk[..c.len()].copy_from_slice(c);
        // push H256 to storage
        let indexed_location = U256::from(location.as_ref());
        pwasm_ethereum::write(&indexed_location.overflowing_add(U256::from(idx)).0.into(), &chunk);
        idx += 1;
    }
}

/// reads a string from sequential blocks at the given location in storage
pub fn read_string(location: &H256) -> String {
    let mut reconstructed: Vec<u8> = Vec::new();
    let mut remaining = U256::from(&pwasm_ethereum::read(location)).low_u64() as usize;
    let mut idx = 1;
    while remaining > 0 {
        let to_read = if remaining >= 32 { 32 } else { remaining };
        let indexed_location = U256::from(location.as_ref()).overflowing_add(U256::from(idx)).0;
        reconstructed.extend_from_slice(&H256::from(&pwasm_ethereum::read(&indexed_location.into())).as_ref()[..remaining]);
        remaining -= to_read;
        idx += 1;
    }
    String::from(from_utf8(&reconstructed).unwrap())
}

// Reads balance by address
pub fn read_balance_of(owner: &Address) -> U256 {
    U256::from_big_endian(&pwasm_ethereum::read(&balance_key(owner)))
}
