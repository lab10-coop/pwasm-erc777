use pwasm_abi::types::*;
use pwasm_abi_derive::eth_abi;

#[eth_abi(ERC777Endpoint, ERC777Client)]
pub trait ERC777Interface {
    fn constructor(&mut self, name: String, symbol: String, granularity: U256);
    fn mint(&mut self, tokenHolder: Address, amount: U256, operatorData: Vec<u8>);

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

    fn disableERC20(&mut self);
    fn enableERC20(&mut self);

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
              operator: Address,
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

    #[event]
    fn ERC20Enabled(&mut self);

    #[event]
    fn ERC20Disabled(&mut self);

    #[event]
    fn Transfer(&mut self, from: Address, to: Address, amount: U256);
}
