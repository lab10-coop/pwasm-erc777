const chai = require('chai');
const assert = chai.assert;

async function getBalance(web3, token, account, expected) {
  return web3.utils.fromWei((await token.contract.methods.balanceOf(account).call()).toString());
}

async function assertBalance(web3, token, account, expected) {
  const balance = (
    await token.contract.methods.balanceOf(account).call()).toString();
  assert.equal(web3.utils.fromWei(balance), expected);
  this.log(`balance[${account}]: ${web3.utils.fromWei(balance)}`);
}

const log = (msg) => process.env.MOCHA_VERBOSE && console.log(msg);
const zeroAddress = '0x0000000000000000000000000000000000000000';

function assertEventWillBeCalled(contract, name, data) {
  return new Promise((resolve, reject) => {
    contract.once(name, function(err, event) {
      if (err) { reject(err); }
      log(`${name} called with ${JSON.stringify(event.returnValues)}`);
      assert.deepOwnInclude(
        event.returnValues, data, `Event: ${name}: invalid data`);
      resolve();
    });
  });
}

function assertEventsWillBeCalled(contract, events) {
  return Promise.all(events
    .map(event => assertEventWillBeCalled(contract, event.name, event.data)));
}

async function initAccounts(web3, accounts) {
  // Add the (well funded) default account first
  accounts.push('0x004ec07d2329997267Ec62b4166639513386F32E');

  // create test accounts
  let password = 'test';
  for (let i = 0; i < 2; ++i) {
    let testAccount = await web3.eth.personal.newAccount(password);
    assert(await web3.eth.personal.unlockAccount(testAccount, password));
    accounts.push(testAccount);
  }
}

function formatAccount(account) {
  return account.slice(0, 8);
}

async function mintForAllAccounts(web3, accounts, token, amount) {
  for (let i = 0; i < accounts.length; ++i) {
    await token.contract.methods
      .mint(accounts[i], web3.utils.toWei(amount), '0x')
      .send({ gas: 300000, from: accounts[0] });
  }
}

async function wipeAccounts(web3, accounts, token) {
  console.log(accounts.slice(1, accounts.length));
  accounts.slice(1, accounts.length).forEach(async (a) => {
    const balance = (
      await token.contract.methods.balanceOf(a).call()).toString();
    assert.equal(web3.utils.fromWei(balance), 0);
  });
}

module.exports = {
  getBalance,
  assertBalance,
  log,
  zeroAddress,
  assertEventWillBeCalled,
  assertEventsWillBeCalled,
  initAccounts,
  formatAccount,
  wipeAccounts,
  mintForAllAccounts,
};
