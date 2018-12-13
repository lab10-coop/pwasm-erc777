const Web3 = require('web3');
const fs = require('fs');
const chai = require('chai');
const assert = chai.assert;

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

let token = {
  name: 'ReferenceToken',
};

describe('pwasm ERC777 contract', function() {
  before(async () => {
    web3.eth.defaultAccount = '0x004ec07d2329997267ec62b4166639513386f32e';

    const abi = JSON.parse(fs.readFileSync('./contracts/pwasm-erc777/target/json/ERC777Interface.json'));
    const codeHex = '0x' + fs.readFileSync('./contracts/pwasm-erc777/target/pwasm_erc777.wasm').toString('hex');
    const tokenContract = new web3.eth.Contract(abi, { data: codeHex, from: web3.eth.defaultAccount });
    const TokenDeployTransaction = tokenContract
      .deploy({ data: codeHex,
        arguments: [
          token.name,
        ],
      });
    const gas = await TokenDeployTransaction.estimateGas();
    token.contract = await TokenDeployTransaction.send({ gasLimit: gas, from: web3.eth.defaultAccount });
    assert.ok(token.contract.options.address);
  });

  describe('attributes', function() {
    it(`should have the name "${token.name}"`, async function() {
      const name = await token.contract.methods.name().call();
      assert.strictEqual(name, token.name);
    });
  });
});
