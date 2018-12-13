// pwasm contracts do not use Rust's standard library
#![no_std]

mod keys;
mod utils;

pub mod token {
    use pwasm_std::String;
    use pwasm_abi::types::U256;
    use pwasm_abi_derive::eth_abi;
    use crate::keys::*;
    use crate::utils::*;

    #[eth_abi(ERC777Endpoint, ERC777Client)]
    pub trait ERC777Interface {
        fn constructor(&mut self, name: String, symbol: String);

        #[constant]
        fn name(&mut self) -> String;

        #[constant]
        fn symbol(&mut self)-> String;

        #[constant]
        fn totalSupply(&mut self) -> U256;
    }

    pub struct ERC777Contract;

    impl ERC777Interface for ERC777Contract {

        fn constructor(&mut self, name: String, symbol: String) {
            write_string(&name_key(), &name);
            write_string(&symbol_key(), &symbol);
        }

        fn name(&mut self) -> String {
            read_string(&name_key())
        }

        fn symbol(&mut self)-> String {
            read_string(&symbol_key())
        }

        fn totalSupply(&mut self) -> U256 {
            U256::from_big_endian(&pwasm_ethereum::read(&total_supply_key()))
        }
    }
}

// Declares the dispatch and dispatch_ctor methods
use pwasm_abi::eth::EndpointInterface;

/// Will be described in the next step
#[no_mangle]
pub fn deploy() {
    let mut endpoint = token::ERC777Endpoint::new(token::ERC777Contract{});
    endpoint.dispatch_ctor(&pwasm_ethereum::input());
}

/// The call function is the main function of the *deployed* contract
#[no_mangle]
pub fn call() {
    let mut endpoint = token::ERC777Endpoint::new(token::ERC777Contract{});
    pwasm_ethereum::ret(&endpoint.dispatch(&pwasm_ethereum::input()));
}

#[cfg(test)]
mod tests {
    use crate::*;
    use crate::token::ERC777Interface;
    use pwasm_std::String;
    use pwasm_abi::types::*;
    use pwasm_test::{ext_reset};

    static TEST_NAME: &'static str = "TestToken";
    static TEST_SYMBOL: &'static str = "TTK";

    fn init_test_contract() -> token::ERC777Contract {
        let mut contract = token::ERC777Contract{};
        let owner_address = Address::from([0xea, 0x67, 0x4f, 0xdd, 0xe7, 0x14, 0xfd, 0x97, 0x9d, 0xe3, 0xed, 0xf0, 0xf5, 0x6a, 0xa9, 0x71, 0x6b, 0x89, 0x8e, 0xc8]);
        // Here we're creating an External context using ExternalBuilder and set the `sender` to the `owner_address`
        ext_reset(|e| e.sender(owner_address.clone()));

        let name = String::from(TEST_NAME);
        let symbol = String::from(TEST_SYMBOL);
        contract.constructor(name.clone(), symbol);
        contract
    }

    #[test]
    fn should_set_and_retrieve_the_correct_token_name() {
        let mut contract = init_test_contract();
        assert_eq!(contract.name(), TEST_NAME);
    }

    #[test]
    fn should_set_and_retrieve_the_correct_token_symbol() {
        let mut contract = init_test_contract();
        assert_eq!(contract.symbol(), TEST_SYMBOL);
    }

    #[test]
    fn initial_total_supply_should_be_zero() {
        let mut contract = init_test_contract();
        assert_eq!(contract.totalSupply(), U256::zero());
    }
}
