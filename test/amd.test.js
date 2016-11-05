describe('when used as AMD module', function() {

  if(typeof define !== 'function') {
    return;
  }

  before(function() {
    require.config({
      paths: {
        'chai-change': '../src/plugin',
        'chai': '../node_modules/chai/chai'
      }
    });
  });

  it('works as an AMD module', function(done) {
    require(['chai', 'chai-change'], function(chai, chaiChange) {
      chai.assert.isUndefined(chai.assert.alters);
      chai.use(chaiChange);
      chai.assert.isDefined(chai.assert.alters);
      done();
    });
  });

});
