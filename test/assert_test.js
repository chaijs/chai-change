var assert = chai.assert;
describe('assert interface', function() {

  it('provides alter and unaltered to enforce changes', function() {
    var value = 'start';

    t(function() { assert.alters(changeValue('end'), getValue); });
    t(function() { assert.alters(changeValue('end'), getValue, { from: 'start' }); });
    t(function() { assert.alters(changeValue('end'), getValue, { to: 'end' }); });

    value = 10;
    assert.alters(changeValue(15), getValue, { by: 5 });

    t(function() { assert.unaltered(noop, getValue) });
    t(function() { assert.unaltered(noop, getValue, { from: 'start' }) });

    t(function() { assert.unaltered(noop, getValue, { to: 'whevil' }) });

    // test examples
    var x = 0;
    assert.alters(function() { x += 1; }, function() { return x });

    assert.unaltered(function() {}, function() { return x });

    assert.alters(function() { x += 1; }, function() { return x; }, { by: 1 });
    assert.alters(function() { x += 1; }, function() { return x; }, { from: x });
    assert.alters(function() { x += 1; }, function() { return x; }, { from: x, to: x + 1 });
    assert.alters(function() { x += 1; }, function() { return x; }, { to: x + 1 });

    var x = 0;
    assert.unaltered(noop, function() { return x });

    function getValue() {
      return value;
    }

    function changeValue(to) {
      return function() {
        value = to;
      };
    }

    function t(testFn) {
      testFn();
      value = 'start';
    }

    function noop() {}
  });

  describe('with promises', function() {
    it('passes errors from changeWatcher through to `callback:`', function(done) {
      assert.alters(function() {
      }, function() {
        return Promise.reject('value error');
      }, {
        callback: callback
      });

      function callback(err) {
        chai.assert.equal(err, 'value error');
        done();
      }
    });

    it('passes errors from alter through to `callback:`', function(done) {
      assert.alters(function() {
        return Promise.reject('alter error');
      }, function() {
      }, {
        callback: callback
      });

      function callback(err) {
        chai.assert.equal(err, 'alter error');
        done();
      }
    });

    context('when only alter function returns a promise', function() {
      it('returns a promise from the expectation', function(done) {
        var count = 0;
        return assert.alters(function() {
          count += 1;
          return Promise.resolve();
        }, function() {
          return count;
        }, { by: 1 })
        .then(done)
        .catch(done);
      });
    });

    context('when only changeWatcher returns a promise', function() {
      it('returns a promise from the expectation', function(done) {
        var count = 0;
        return assert.alters(function() {
          count += 1;
        }, function() {
          return Promise.resolve(count);
        }, { by: 1 })
        .then(done)
        .catch(done);
      });
    });

    context('when both changeWatcher and alter function return promises', function() {
      it('returns a promise from the expectation', function(done) {
        var count = 0;
        return assert.alters(function() {
          count += 1;
          return Promise.resolve();
        }, function() {
          return Promise.resolve(count);
        }, { by: 1 })
        .then(done)
        .catch(done);
      });
    });

    it('can have synchronous changeWatcher and async alter function', function(done) {
      var count = 0;
      var User = {
        create: function() {
          return new Promise(function(resolve) {
            setTimeout(function() {
              count += 1
              resolve();
            });
          });
        },
        count: function() {
          return count;
        },
      };

      assert.alters(function() {
        return User.create({name: 'bob'});
      }, function() {
        return User.count();
      }, {
        by: 1,
        callback: done
      });
    });

    it('can have asynchronous changeWatcher and sync alter function', function(done) {
      var count = 0;
      var User = {
        create: function() {
          count += 1
        },
        count: function() {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              resolve(count);
            });
          });
        },
      };

      assert.alters(function() {
        User.create({name: "bob"})
      }, function() {
        return User.count();
      }, {
        by: 1,
        callback: done
      });
    });

    it('can have asynchronous changeWatcher and alter functions', function(done) {
      var User = userSetupAsync();

      assert.alters(function() {
        return User.create({name: "bob"});
      }, function() {
        return User.count();
      },{
        by: 1,
        callback: done
      });
    });

    it('works in passing cases without callback: option', function() {
      var User = userSetupAsync();
      return assert.alters(function() {
        return User.create({name: "bob"});
      }, function() {
        return User.count();
      },{
        by: 1,
      });
    });

    it('works in failing cases without callback: option', function() {
      var User = userSetupAsync();

      return assertRejected(/expected.+to change/, assert.alters(function() {
        return new Promise(function(resolve) { resolve() });
      }, function() {
        return User.count();
      },{
        by: 1,
      }));
    });

    it('rejects if affect rejects', function() {
      var User = userSetupAsync();

      return assertRejected(/fail/, assert.alters(function() {
        return new Promise(function(resolve, reject) { reject(Error("fail")) });
      }, function() {
        return User.count();
      },{
        by: 1,
      }))
    });

    it('rejects if getValue rejects', function() {
      return assertRejected(/fail/, assert.alters(function() {
        return new Promise(function(resolve) { resolve() });
      }, function() {
        return new Promise(function(resolve, reject) { reject(Error("fail")) });
      },{
        by: 1,
      }))
    });

    function assertRejected(matcher, p) {
      var rejected = false;

      return p.catch(function (err){
        rejected = true;
        assert.match(err.message, matcher);
      })
      .then(function (v) {
        if(!rejected) {
          throw Error("should have been rejected, but was resolved with: " + v);
        }
        return v;
      });
    }

    function userSetupAsync() {
      var count = 0;
      return {
        create: function() {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              count += 1
              resolve();
            })
          });
        },
        count: function() {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              resolve(count);
            });
          });
        },
      };
    }
  });
});

