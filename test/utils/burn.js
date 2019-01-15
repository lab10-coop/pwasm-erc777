/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const utils = require('./index');
  
exports.test = function(web3, accounts, token) {
  describe('burn', function() {
    beforeEach(async function() {
      await utils.mintForAllAccounts(web3, accounts, token, '10');
    });

    it(`should let account 0 burn 3 ${token.symbol}`,
      async function() {
        let prevTokens = await utils.getBalance(web3, token, accounts[0]);

        let eventsCalled = utils.assertEventsWillBeCalled(
          token.contract, [{
            name: 'Burned',
            data: {
              operator: accounts[0],
              from: accounts[0],
              amount: web3.utils.toWei('3'),
              data: '0xbeef',
              operatorData: null,
            },
          }, {
            name: 'Transfer',
            data: {
              from: accounts[0],
              to: utils.zeroAddress,
              amount: web3.utils.toWei('3'),
            },
          }]
        );

        await token.contract.methods
          .burn(web3.utils.toWei('3'), '0xbeef')
          .send({ gas: 300000, from: accounts[0] });

        await utils.assertBalance(
          web3, token, accounts[0], prevTokens - 3);

        await eventsCalled;
      }
    );
  });
};
