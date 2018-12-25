const chai = require('chai');
const assert = chai.assert;

exports.test = function(web3, accounts, token) {
  describe('attributes', function() {
    it(`should have the name "${token.name}"`, async function() {
      const name = await token.contract.methods.name().call();
      assert.strictEqual(name, token.name);
    });
    it(`should have the symbol "${token.symbol}"`, async function() {
      const symbol = await token.contract.methods.symbol().call();
      assert.strictEqual(symbol, token.symbol);
    });
    it('should have an initial total supply of 0', async function() {
      const totalSupply = await token.contract.methods.totalSupply().call();
      assert.equal(web3.utils.fromWei(totalSupply), 0);
    });
    it(`should have a granularity of ${token.granularity}`,
      async function() {
        const granularity = (
          await token.contract.methods.granularity().call()).toString();
        assert.strictEqual(
          web3.utils.fromWei(granularity),
          token.granularity
        );
      }
    );
  });
};
