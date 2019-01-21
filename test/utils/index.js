const chai = require('chai');
const assert = chai.assert;

const log = (msg) => process.env.MOCHA_VERBOSE && console.log(msg);
const zeroAddress = '0x0000000000000000000000000000000000000000';

async function getBalance(web3, token, account, expected) {
  return web3.utils.fromWei((await token.contract.methods.balanceOf(account).call()).toString());
}

async function assertBalance(web3, token, account, expected) {
  const balance = (
    await token.contract.methods.balanceOf(account).call()).toString();
  assert.equal(web3.utils.fromWei(balance), expected);
  log(`balance[${account}]: ${web3.utils.fromWei(balance)}`);
}

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

const password = 'test';

async function unlockAccount(web3, account) {
  assert(await web3.eth.personal.unlockAccount(account, password));
}

async function initAccounts(web3, accounts) {
  // Add the (well funded) default account first
  accounts.push('0x004ec07d2329997267Ec62b4166639513386F32E');

  // create test accounts
  for (let i = 0; i < 2; ++i) {
    let testAccount = await web3.eth.personal.newAccount(password);
    // Transfer some funds to it for transactions
    await web3.eth.sendTransaction({
      from: web3.eth.defaultAccount,
      to: testAccount,
      value: web3.utils.toWei('0.5'),
      gas: 21000,
      gasPrice: 20000000000,
    });
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

async function assertTotalSupply(web3, token, expected) {
  const totalSupply = (
    await token.contract.methods.totalSupply().call()).toString();
  assert.equal(web3.utils.fromWei(totalSupply), expected);
  log(`totalSupply: ${web3.utils.fromWei(totalSupply)}`);
}

async function wipeTokenBalances(web3, accounts, token) {
  for (let i = 0; i < accounts.length; ++i) {
    let balance = await getBalance(web3, token, accounts[i]);
    await unlockAccount(web3, accounts[i]);
    await token.contract.methods
      .burn(web3.utils.toWei(balance), '0xbeef')
      .send({ gas: 300000, from: accounts[i] });
    await assertBalance(web3, token, accounts[i], '0');
  }
  await assertTotalSupply(web3, token, '0');
}

async function sendTokenBalance(web3, token, from, to, amount, data) {
  await unlockAccount(web3, from);
  await token.contract.methods
    .send(to, amount, data)
    .send({ gas: 300000, from: from });
}

module.exports = {
  getBalance,
  assertBalance,
  log,
  zeroAddress,
  assertEventWillBeCalled,
  assertEventsWillBeCalled,
  initAccounts,
  unlockAccount,
  formatAccount,
  wipeTokenBalances,
  mintForAllAccounts,
  assertTotalSupply,
  sendTokenBalance,
};
