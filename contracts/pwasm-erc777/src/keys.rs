/// "Eternal Storage" keys used in the ERC777 contract implementation

use keccak_derive::compiletime_keccak;
use pwasm_abi::types::{H256, Address};

compiletime_keccak!(name_key);
compiletime_keccak!(symbol_key);
compiletime_keccak!(total_supply_key);
compiletime_keccak!(granularity_key);

pub fn balance_key(address: &Address) -> H256 {
    let mut key = H256::from(*address);
    // just a naive "namespace"
    key.as_mut()[0] = 1;
    key
}
