const chai = require('chai');
const assert = chai.assert;

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

function formatAccount(account) {
  return account.slice(0, 8);
}

module.exports = {
  assertBalance,
  log,
  zeroAddress,
  assertEventWillBeCalled,
  assertEventsWillBeCalled,
  formatAccount,
};
