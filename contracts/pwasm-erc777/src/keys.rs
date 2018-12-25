/// "Eternal Storage" keys used in the ERC777 contract implementation

use pwasm_std::keccak;
use pwasm_abi::types::{ H256, Address };

pub fn name_key() -> H256 {
    keccak(b"NAME_KEY")
}

pub fn symbol_key() -> H256 {
    keccak(b"SYMBOL_KEY")
}

pub fn total_supply_key() -> H256 {
    keccak(b"TOTAL_SUPPLY_KEY")
}

pub fn granularity_key() -> H256 {
    keccak(b"GRANULARITY_KEY")
}

pub fn balance_key(address: &Address) -> H256 {
    let mut key = H256::from(*address);
    // just a naive "namespace"
    key.as_mut()[0] = 1;
    key
}
