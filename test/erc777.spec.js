const Web3 = require('web3');
const fs = require('fs');
const chai = require('chai');
const assert = chai.assert;

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

let token = {
  name: 'ReferenceToken',
  symbol: 'XRT',
  granularity: '0.01',
};

let accounts = [];

describe('pwasm ERC777 contract', function() {
  before(async () => {
    web3.eth.defaultAccount = '0x004ec07d2329997267ec62b4166639513386f32e';
    accounts.push(web3.eth.defaultAccount);

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

    // create test accounts
    let testAccountPassword = 'test1';
    let testAccount = await web3.eth.personal.newAccount(testAccountPassword);
    console.log(testAccount);
    assert(await web3.eth.personal.unlockAccount(testAccount, testAccountPassword));
    accounts.push(testAccount);
  });

  require('./utils/attributes').test(web3, accounts, token);
  require('./utils/mint').test(web3, accounts, token);
});
