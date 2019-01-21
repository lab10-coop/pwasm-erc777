use pwasm_abi::types::*;
use pwasm_abi_derive::eth_abi;

#[eth_abi(ERC777TokensRecipientEndpoint, ERC777TokensRecipientClient)]
pub trait ERC777TokensRecipientInterface {
    fn tokensReceived(&mut self,
                      operator: Address,
                      from: Address,
                      to: Address,
                      amount: U256,
                      data: Vec<u8>,
                      operatorData: Vec<u8>
    );
}
