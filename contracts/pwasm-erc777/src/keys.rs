/// "Eternal Storage" keys used in the ERC777 contract implementation

use pwasm_std::keccak;
use pwasm_abi::types::H256;

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
