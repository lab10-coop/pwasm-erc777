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

    it(`should let account 0 burn 3 ${token.symbol}` +
      ' (ERC20 Disabled)', async function() {
      await utils.assertBalance(web3, token, accounts[0], 10);
      await token.contract.methods
        .disableERC20()
        .send({ gas: 300000, from: accounts[0] });

      let eventCalled = utils.assertEventWillBeCalled(
        token.contract,
        'Burned', {
          operator: accounts[0],
          from: accounts[0],
          amount: web3.utils.toWei('3'),
          data: '0xcafe',
          operatorData: null,
        }
      );

      await token.contract.methods
        .burn(web3.utils.toWei('3'), '0xcafe')
        .send({ gas: 300000, from: accounts[0] });

      await utils.assertBalance(
        web3, token, accounts[0], 7);
      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length - 3);
      await eventCalled;

      await token.contract.methods
        .enableERC20()
        .send({ gas: 300000, from: accounts[0] });
    });

    it('should not let account 0 burn -3 ' +
      `${token.symbol} (negative amount)`, async function() {
      await utils.assertBalance(
        web3, token, accounts[0], token.initialSupply + 10);

      await token.contract.methods
        .burn(web3.utils.toWei('-3'), '0x')
        .send({ gas: 300000, from: accounts[0] })
        .should.be.rejectedWith('revert');

      await utils.assertBalance(
        web3, token, accounts[0], token.initialSupply + 10);
      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length + token.initialSupply);
    });

    // deactivated due to compile errors in the pwasm contract when
    // a U256 multiply operation is performed.
    xit('should not let account 1 burn 0.007 ' +
      `${token.symbol} (< granularity)`, async function() {
      await utils.assertBalance(
        web3, token, accounts[0], token.initialSupply + 10);

      await token.contract.methods
        .burn(web3.utils.toWei('0.007'), '0x')
        .send({ gas: 300000, from: accounts[0] })
        .should.be.rejectedWith('revert');

      await utils.assertBalance(
        web3, token, accounts[0], token.initialSupply + 10);
      await utils.assertTotalSupply(
        web3, token, 10 * accounts.length + token.initialSupply);
    });
  });
};
