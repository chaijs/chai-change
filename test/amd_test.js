
describe("chai-change",function() {

  if(typeof define != "function") {
    // ensure browser
    return;
  }

  before(function() {
     require.config({
       paths: {
         "chai-change": "../src/plugin",
         "chai": "../node_modules/chai/chai"
       }
     });
  });


  it("works as an AMD module",function(done) {
    require(["chai","chai-change"],function(chai,chaiChange) {
      assert.isUndefined(chai.assert.change);
      chai.use(chaiChange);
      assert.isDefined(chai.assert.change);
      done();
    });
  });

});
