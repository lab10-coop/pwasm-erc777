const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('pwasm ERC777 contract', function() {
  before(async () => {
    web3.eth.defaultAccount = '0x004ec07d2329997267ec62b4166639513386f32e';
  });
});
