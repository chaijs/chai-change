describe('expect interface', function() {
  /* global chai */
  var expect = chai.expect;

  /* global sharedExamples */
  sharedExamples({
    test: function(changer, changeWatcher, options) {
      return expect(changer).to.alter(changeWatcher, options);
    },

    testNegate: function(changer, changeWatcher, options) {
      return expect(changer).not.to.alter(changeWatcher, options);
    }
  });
});
