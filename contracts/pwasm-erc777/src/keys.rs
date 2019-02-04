/// "Eternal Storage" keys used in the ERC777 contract implementation

use compiletime_keccak::compiletime_keccak;
use pwasm_abi::types::{H256, U256, Address, Vec};
use pwasm_std::keccak;

compiletime_keccak!(owner_key);
compiletime_keccak!(name_key);
compiletime_keccak!(symbol_key);
compiletime_keccak!(total_supply_key);
compiletime_keccak!(granularity_key);
compiletime_keccak!(authorized_operators_key);
compiletime_keccak!(erc20_compatibility_key);
compiletime_keccak!(ERC777TokensSender_key);
compiletime_keccak!(ERC777TokensRecipient_key);

/// Returns the key for reading/storing the balance for the given token holder
pub fn balance_key(token_holder: &Address) -> H256 {
    let mut key = H256::from(*token_holder);
    // just a naive "namespace"
    key.as_mut()[0] = 1;
    key
}

/// Reads the current state of the ERC20 compatibility setting
pub fn erc20_compatible() -> bool {
    U256::from_big_endian(&pwasm_ethereum::read(&erc20_compatibility_key())) == U256::one()
}

/// Calculates the key to read/store operator activation state
/// given the operator address and the token holder address.
pub fn operator_map_key(operator: &Address, token_holder: &Address) -> H256 {
    let mut v = Vec::new();
    v.extend_from_slice(authorized_operators_key().as_ref());
    v.extend_from_slice(operator.as_ref());
    v.extend_from_slice(token_holder.as_ref());
    keccak(&v[..])
}
