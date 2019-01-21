use pwasm_abi::types::*;
use pwasm_abi_derive::eth_abi;

#[eth_abi(ERC820RegistryEndpoint, ERC820RegistryClient)]
pub trait ERC820RegistryInterface {
    #[constant]
    fn getInterfaceImplementer(&mut self, _addr: Address, iHash: [u8; 32]) -> Address;
}
