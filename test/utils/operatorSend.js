/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const utils = require('./index');

exports.test = function(web3, accounts, token) {
  describe('operatorSend', function() {
    beforeEach(async function() {
      await utils.mintForAllAccounts(web3, accounts, token, '10');
    });

    it('should let account 3 ' +
        `send 1.12 ${token.symbol} from account 1 ` +
        'to account 2', async function() {
      let eventsCalled = utils.assertEventsWillBeCalled(
        token.contract, [{
          name: 'AuthorizedOperator',
          data: { operator: accounts[3], tokenHolder: accounts[1] },
        }, {
          name: 'Sent',
          data: {
            operator: accounts[3],
            from: accounts[1],
            to: accounts[2],
            amount: web3.utils.toWei('1.12'),
            data: null,
            operatorData: null,
          },
        }, {
          name: 'Transfer',
          data: {
            from: accounts[1],
            to: accounts[2],
            amount: web3.utils.toWei('1.12'),
          },
        }]
      );

      utils.unlockAccount(web3, accounts[1]);
      await token.contract.methods
        .authorizeOperator(accounts[3])
        .send({ from: accounts[1], gas: 300000 });

      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length + token.initialSupply);
      await utils.assertBalance(web3, token, accounts[1], 10);
      await utils.assertBalance(web3, token, accounts[2], 10);

      utils.unlockAccount(web3, accounts[3]);
      await token.contract.methods
        .operatorSend(
          accounts[1], accounts[2], web3.utils.toWei('1.12'), '0x', '0x')
        .send({ gas: 300000, from: accounts[3] });

      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length + token.initialSupply);
      await utils.assertBalance(web3, token, accounts[1], 8.88);
      await utils.assertBalance(web3, token, accounts[2], 11.12);
      await eventsCalled;
    });
  });
};
