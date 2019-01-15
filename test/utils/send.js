/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const utils = require('./index');
 
exports.test = function(web3, accounts, token) {
  describe('send', function() {
    beforeEach(async function() {
      await utils.mintForAllAccounts(web3, accounts, token, '10');
    });

    it('should let account 1' +
      `send 3 ${token.symbol} with empty data ` +
      'to account2', async function() {
      //  await utils.assertBalance(web3, token, accounts[1], 10);
      //  await utils.assertBalance(web3, token, accounts[2], 10);
    });
  });
};
