/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const utils = require('./index');

exports.test = function(web3, accounts, token) {
  describe('operatorBurn', function() {
    beforeEach(async function() {
      await utils.mintForAllAccounts(web3, accounts, token, '10');
    });

    it('should let account 3 ' +
      `burn 1.12 ${token.symbol} from ` +
      'account 1', async function() {
      utils.unlockAccount(web3, accounts[1]);
      await token.contract.methods
        .authorizeOperator(accounts[3])
        .send({ from: accounts[1], gas: 300000 });
  
      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length + token.initialSupply);
      await utils.assertBalance(web3, token, accounts[1], 10);

      let eventsCalled = utils.assertEventsWillBeCalled(
        token.contract, [{
          name: 'Burned',
          data: {
            operator: accounts[3],
            from: accounts[1],
            amount: web3.utils.toWei('1.12'),
            data: null,
            operatorData: null,
          },
        }, {
          name: 'Transfer',
          data: {
            from: accounts[1],
            to: utils.zeroAddress,
            amount: web3.utils.toWei('1.12'),
          },
        }]
      );

      utils.unlockAccount(web3, accounts[3]);
      await token.contract.methods
        .operatorBurn(
          accounts[1], web3.utils.toWei('1.12'), '0x', '0x')
        .send({ gas: 300000, from: accounts[3] });

      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length + token.initialSupply - 1.12);
      await utils.assertBalance(web3, token, accounts[1], 8.88);
      await eventsCalled;
    });
  });
};
