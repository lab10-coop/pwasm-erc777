// Contract doesn't use Rust's standard library
#![no_std]

pub mod token {
    use pwasm_abi_derive::eth_abi;
    use pwasm_std::String;

    #[eth_abi(ERC777Endpoint, ERC777Client)]
    pub trait ERC777Interface {

        #[constant]
        fn name(&mut self) -> String;
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
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
