use pwasm_abi::types::*;
use pwasm_abi_derive::eth_abi;

#[eth_abi(ERC777TokensSenderEndpoint, ERC777TokensSenderClient)]
pub trait ERC777TokensSenderInterface {
    fn tokensToSend(&mut self,
                    operator: Address,
                    from: Address,
                    to: Address,
                    amount: U256,
                    userData: Vec<u8>,
                    operatorData: Vec<u8>
    );
}
