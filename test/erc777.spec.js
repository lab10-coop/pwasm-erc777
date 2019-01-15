const Web3 = require('web3');
const fs = require('fs');
const utils = require('./utils/index');
const chai = require('chai');
const assert = chai.assert;

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8546'));

let token = {
  name: 'ReferenceToken',
  symbol: 'XRT',
  granularity: '0.01',
};

let accounts = [];

describe('pwasm ERC777 contract', function() {
  this.timeout(5000);

  before(async () => {
    web3.eth.defaultAccount = '0x004ec07d2329997267Ec62b4166639513386F32E';

    const abi = JSON.parse(fs.readFileSync('./contracts/pwasm-erc777/target/json/ERC777Interface.json'));
    const codeHex = '0x' + fs.readFileSync('./contracts/pwasm-erc777/target/pwasm_erc777.wasm').toString('hex');
    const tokenContract = new web3.eth.Contract(abi, { data: codeHex, from: web3.eth.defaultAccount });
    const TokenDeployTransaction = tokenContract
      .deploy({ data: codeHex,
        arguments: [
          token.name,
          token.symbol,
          web3.utils.toWei(token.granularity),
        ],
      });
    const gas = await TokenDeployTransaction.estimateGas();
    token.contract = await TokenDeployTransaction.send({ gasLimit: gas, from: web3.eth.defaultAccount });
    assert.ok(token.contract.options.address);

    // Activate ERC20 compatibility
    await token.contract.methods
      .enableERC20()
      .send({ gas: 300000, from: accounts[0] });

    await utils.initAccounts(web3, accounts);
  });

  beforeEach(async () => {
    await utils.wipeTokenBalances(web3, accounts, token);
  });

  require('./utils/attributes').test(web3, accounts, token);
  require('./utils/mint').test(web3, accounts, token);
  require('./utils/burn').test(web3, accounts, token);
  require('./utils/send').test(web3, accounts, token);

  after(function() {
    // Close the connection to allow this process to end
    web3.currentProvider.connection.close();
  });
});
