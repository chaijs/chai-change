describe('assert interface', function() {
  /* global chai */
  var assert = chai.assert;

  /* global sharedExamples */
  sharedExamples({
    test: function(changer, changeWatcher, options) {
      return assert.alters(changer, changeWatcher, options);
    },

    testNegate: function(changer, changeWatcher, options) {
      return assert.unaltered(changer, changeWatcher, options);
    }
  });

  describe('when custom message is set', function() {
    describe('when change is expected', function() {
      it('throws with custom message', function() {
        assert.throws(function() {
          assert.alters(function() {}, function() {
            return 'not changed';
          }, 'custom message');
        }, 'custom message');
      });
    });

    describe('when change is not expected', function() {
      it('throws with custom message', function() {
        assert.throws(function() {
          var value = 'initial';
          assert.unaltered(function() {
            value = 'changed';
          }, function() {
            return value;
          }, 'custom message');
        }, 'custom message');
      });
    });
  });
});
