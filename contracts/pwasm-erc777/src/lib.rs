// pwasm contracts do not use Rust's standard library
#![no_std]

mod keys;
mod utils;

pub mod token {
    use pwasm_abi_derive::eth_abi;
    use pwasm_std::String;
    use crate::keys::*;
    use crate::utils::*;

    #[eth_abi(ERC777Endpoint, ERC777Client)]
    pub trait ERC777Interface {
        fn constructor(&mut self, name: String);

        /// The ERC777 Token name
        #[constant]
        fn name(&mut self) -> String;
    }

    pub struct ERC777Contract;

    impl ERC777Interface for ERC777Contract {

        fn constructor(&mut self, name: String) {
            write_string(&name_key(), &name);
        }

        fn name(&mut self) -> String {
            read_string(&name_key())
        }
    }
}

/// Will be described in the next step
#[no_mangle]
pub fn deploy() {
}

/// The call function is the main function of the *deployed* contract
#[no_mangle]
pub fn call() {
    // Send a result pointer to the runtime
    pwasm_ethereum::ret(&b"result"[..]);
}

#[cfg(test)]
mod tests {
    use crate::*;
    use crate::token::ERC777Interface;
    use pwasm_std::String;
    use pwasm_abi::types::*;
    use pwasm_test::{ext_reset};

    #[test]
    fn should_set_and_retrieve_the_correct_token_name() {
        let mut contract = token::ERC777Contract{};
        let owner_address = Address::from([0xea, 0x67, 0x4f, 0xdd, 0xe7, 0x14, 0xfd, 0x97, 0x9d, 0xe3, 0xed, 0xf0, 0xf5, 0x6a, 0xa9, 0x71, 0x6b, 0x89, 0x8e, 0xc8]);
        // Here we're creating an External context using ExternalBuilder and set the `sender` to the `owner_address`
        ext_reset(|e| e.sender(owner_address.clone()));

        let name = String::from("TestToken");
        contract.constructor(name.clone());

        assert_eq!(contract.name(), name);
    }
}
