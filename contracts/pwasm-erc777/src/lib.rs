// pwasm contracts do not use Rust's standard library
#![no_std]
#![allow(non_snake_case)]

mod keys;
mod utils;

pub mod token {
    use pwasm_std::String;
    use pwasm_abi::types::*;
    use pwasm_abi_derive::eth_abi;
    use crate::keys::*;
    use crate::utils::*;

    #[eth_abi(ERC777Endpoint, ERC777Client)]
    pub trait ERC777Interface {
        fn constructor(&mut self, name: String, symbol: String, granularity: U256);
        fn mint(&mut self, address: Address, amount: U256, operatorData: Vec<u8>);

        #[constant]
        fn name(&mut self) -> String;

        #[constant]
        fn symbol(&mut self) -> String;

        #[constant]
        fn totalSupply(&mut self) -> U256;

        #[constant]
        fn balanceOf(&mut self, owner: Address) -> U256;

        #[constant]
        fn granularity(&mut self) -> U256;

        #[constant]
        fn defaultOperators(&mut self) -> Vec<Address>;
        fn authorizeOperator(&mut self, operator: Address);
        fn revokeOperator(&mut self, operator: Address);
        #[constant]
        fn isOperatorFor(&mut self, operator: Address, tokenHolder: Address) -> bool;

        fn send(&mut self, to: Address, amount: U256, data: Vec<u8>);
        fn operatorSend(&mut self, from: Address, to: Address, amount: U256, data: Vec<u8>, operatorData: Vec<u8>);

        fn burn(&mut self, amount: U256, data: Vec<u8>);
        fn operatorBurn(&mut self, from: Address, amount: U256, data: Vec<u8>, operatorData: Vec<u8>);

        #[event]
        fn Sent(&mut self,
                operator: Address,
                from: Address,
                to: Address,
                amount: U256,
                data: Vec<u8>,
                operatorData: Vec<u8>,
        );

        #[event]
        fn Minted(&mut self,
                  from: Address,
                  to: Address,
                  amount: U256,
                  operatorData: Vec<u8>);

        #[event]
        fn Burned(&mut self,
                  operator: Address,
                  from: Address,
                  amount: U256,
                  data: Vec<u8>,
                  operatorData: Vec<u8>);

        #[event]
        fn AuthorizedOperator(&mut self,
                              operator: Address,
                              tokenHolder: Address);

        #[event]
        fn RevokedOperator(&mut self,
                           operator: Address,
                           tokenHolder: Address);
    }

    pub struct ERC777Contract;

    impl ERC777Interface for ERC777Contract {
        fn constructor(&mut self, name: String, symbol: String, granularity: U256) {
            write_string(&name_key(), &name);
            write_string(&symbol_key(), &symbol);
            pwasm_ethereum::write(&granularity_key(), &granularity.into());
        }

        fn mint(&mut self, address: Address, amount: U256, operatorData: Vec<u8>) {
            pwasm_ethereum::write(&total_supply_key(),
                                  &self.totalSupply()
                                      .saturating_add(amount).into());

            pwasm_ethereum::write(&balance_key(&address),
                                  &read_balance_of(&address)
                                      .saturating_add(amount).into());

            self.Minted(Address::zero(), address, amount, operatorData);
        }

        fn name(&mut self) -> String {
            read_string(&name_key())
        }

        fn symbol(&mut self) -> String {
            read_string(&symbol_key())
        }

        fn totalSupply(&mut self) -> U256 {
            U256::from_big_endian(&pwasm_ethereum::read(&total_supply_key()))
        }

        fn balanceOf(&mut self, owner: Address) -> U256 {
            U256::from_big_endian(&pwasm_ethereum::read(&balance_key(&owner)))
        }

        fn granularity(&mut self) -> U256 {
            U256::from_big_endian(&pwasm_ethereum::read(&granularity_key()))
        }

        fn defaultOperators(&mut self) -> Vec<Address> {
            Vec::new()
        }

        fn authorizeOperator(&mut self, _operator: Address) {}

        fn revokeOperator(&mut self, _operator: Address) {}

        fn isOperatorFor(&mut self, _operator: Address, _tokenHolder: Address) -> bool {
            false
        }

        fn send(&mut self, _to: Address, _amount: U256, _data: Vec<u8>) {}

        fn operatorSend(&mut self, _from: Address, _to: Address, _amount: U256, _data: Vec<u8>, _operatorData: Vec<u8>) {}

        fn burn(&mut self, _amount: U256, _data: Vec<u8>) {}

        fn operatorBurn(&mut self, _from: Address, _amount: U256, _data: Vec<u8>, _operatorData: Vec<u8>) {}
    }

    // Reads balance by address
    fn read_balance_of(owner: &Address) -> U256 {
        U256::from_big_endian(&pwasm_ethereum::read(&balance_key(owner)))
    }
}

// Declares the dispatch and dispatch_ctor methods
use pwasm_abi::eth::EndpointInterface;

/// Will be described in the next step
#[no_mangle]
pub fn deploy() {
    let mut endpoint = token::ERC777Endpoint::new(token::ERC777Contract {});
    endpoint.dispatch_ctor(&pwasm_ethereum::input());
}

/// The call function is the main function of the *deployed* contract
#[no_mangle]
pub fn call() {
    let mut endpoint = token::ERC777Endpoint::new(token::ERC777Contract {});
    pwasm_ethereum::ret(&endpoint.dispatch(&pwasm_ethereum::input()));
}

#[cfg(test)]
mod tests {
    use crate::*;
    use crate::token::ERC777Interface;
    use pwasm_std::String;
    use pwasm_abi::types::*;
    use pwasm_test::ext_reset;
    use pwasm_std::keccak;

    static TEST_NAME: &'static str = "TestToken";
    static TEST_SYMBOL: &'static str = "TTK";
    static TEST_GRANULARITY: u64 = 100000000000000;

    fn init_test_contract() -> token::ERC777Contract {
        let mut contract = token::ERC777Contract {};
        let owner_address = Address::from([0xea, 0x67, 0x4f, 0xdd, 0xe7, 0x14, 0xfd, 0x97, 0x9d, 0xe3, 0xed, 0xf0, 0xf5, 0x6a, 0xa9, 0x71, 0x6b, 0x89, 0x8e, 0xc8]);
        // Here we're creating an External context using ExternalBuilder and set the `sender` to the `owner_address`
        ext_reset(|e| e.sender(owner_address.clone()));

        let name = String::from(TEST_NAME);
        let symbol = String::from(TEST_SYMBOL);
        contract.constructor(name.clone(), symbol, U256::from(TEST_GRANULARITY));
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

    #[test]
    fn should_set_and_retrieve_granularity() {
        let mut contract = init_test_contract();
        assert_eq!(contract.granularity(), U256::from(TEST_GRANULARITY));
    }

    keccak_derive::compiletime_keccak!(hashed_string);

    #[test]
    fn compare_compile_time_to_runtime_keccak() {
        let hash = keccak(b"hashed_string");
        assert_eq!(hashed_string(), hash);
    }
}
