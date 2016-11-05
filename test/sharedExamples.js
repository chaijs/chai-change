(function() {
  /* global Promise, chai */
  var expect = chai.expect;

  function sharedExamples(options) {
    var test = options.test;
    var testNegate = options.testNegate;

    var noop = function() {};

    describe('when no options is set', function() {
      it('throws when value does not change', function() {
        expect(function() {
          test(noop, function() {
            return 'start';
          });
        }).to.throw("expected value to have changed from 'start'");
      });

      it('does not throw if value changes', function() {
        var value = 'start';

        test(function() {
          value = 'end';
        }, function() {
          return value;
        });
      });

      describe('when is negated', function() {
        it('does not throw if value does not change', function() {
          testNegate(noop, function() {
            return 'not changed';
          });
        });
      });
    });

    describe('when initial value is set', function() {
      it('throws when value does not change', function() {
        expect(function() {
          test(noop, function() {
            return 'start';
          }, { from: 'expected initial' });
        }).to.throw("alters 'from' value wasn't equal to 'start'");
      });

      it('does not throw if value changes from initial', function() {
        var value = 'start';
        test(function() {
          value = 'end';
        }, function() {
          return value;
        }, { from: 'start' });
      });
    });

    describe('when expected final value is set', function() {
      it('throws when value does not change to expected final', function() {
        expect(function() {
          var value = 'start';
          test(function() {
            value = 'not the expected final value';
          }, function() {
            return value;
          }, { to: 'end' });

        }).to.throw("expected 'start' to change to 'end', instead changed to 'not the expected final value'");
      });

      it('does not throw if value changes to expected final', function() {
        var value = 'start';
        test(function() {
          value = 'end';
        }, function() {
          return value;
        }, { to: 'end' });
      });
    });

    describe('when specific amount is set', function() {
      it('throws when value does not change by expected amount', function() {
        expect(function() {
          var value = 10;
          test(function() {
            value = 15;
          }, function() {
            return value;
          }, { by: 10 });

        }).to.throw('expected 10 to change to 20, instead changed to 15');
      });

      it('does not throw if value changes by expected amount', function() {
        var value = 10;
        test(function() {
          value = 20;
        }, function() {
          return value;
        }, { by: 10 });
      });

      it('validates that expected change amount is numeric', function() {
        expect(function() {
          test(noop, noop, { by: 'fnord' });
        }).to.throw('alters "by" assertions only work with numbers specified in "by" and or "from" options');

        expect(function() {
          test(noop, noop, { by: 5, from: 'fnord' });
        }).to.throw('alters "by" assertions only work with numbers specified in "by" and or "from" options');
      });
    });

    describe('asynchronous support', function() {
      describe('with error-first callbacks', function() {
        it('passes errors from changeWatcher through to `callback`', function() {
          test(noop, function(value) {
            value('changeWatcher error');
          }, {
            callback: function(err) {
              expect(err).to.equal('changeWatcher error');
            }
          });
        });

        it('passes errors from changer through to `callback`', function() {
          test(function(done) {
            done('changer error');
          }, noop, {
            callback: function(err) {
              expect(err).to.equal('changer error');
            }
          });
        });

        it('can have sync changeWatcher and async changer', function(done) {
          var count = 0;

          var User = {
            create: function(attrs, createCallback) {
              setTimeout(function() {
                count += 1;
                createCallback();
              }, 5);
            },
            count: function() {
              return count;
            },
          };

          test(function(createCallback) {
            User.create({ name: 'bob' }, createCallback);
          }, function() {
            return User.count();
          }, {
            by: 1,
            callback: done
          });
        });

        it('can have async changeWatcher and sync changer', function(done) {
          var count = 0;

          var User = {
            create: function() {
              count += 1;
            },
            count: function(countCallback) {
              setTimeout(function() {
                countCallback(null, count);
              }, 5);
            },
          };

          test(function() {
            User.create({ name: 'bob' });
          }, function(countCallback) {
            User.count(countCallback);
          }, {
            by: 1,
            callback: done
          });
        });

        it('can have asynchronous changeWatcher and changer functions', function(done) {
          var count = 0;

          var User = {
            create: function(attrs, createCallback) {
              setTimeout(function() {
                count += 1;
                createCallback();
              }, 5);
            },
            count: function(countCallback) {
              setTimeout(function() {
                countCallback(null, count);
              }, 5);
            },
          };

          test(function(createCallback) {
            User.create({ name: 'bob' }, createCallback);
          }, function(countCallback) {
            User.count(countCallback);
          }, {
            by: 1,
            callback: done
          });
        });
      });

      describe('with promises', function() {
        it('passes errors from changeWatcher through to `callback`', function(done) {
          test(noop, function() {
            return Promise.reject('changeWatcher error');
          }, {
            callback: function(err) {
              expect(err).to.equal('changeWatcher error');
              done();
            }
          });
        });

        it('passes errors from changer through to `callback`', function(done) {
          test(function() {
            return Promise.reject('changer error');
          }, noop, {
            callback: function(err) {
              expect(err).to.equal('changer error');
              done();
            }
          });
        });

        context('when only changer function returns a promise', function() {
          it('returns a promise from the expectation', function(done) {
            var count = 0;

            return test(function() {
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
            return test(function() {
              count += 1;
            }, function() {
              return Promise.resolve(count);
            }, { by: 1 })
            .then(done)
            .catch(done);
          });
        });

        context('when both changeWatcher and changer functions return promises', function() {
          it('returns a promise from the expectation', function(done) {
            var count = 0;

            return test(function() {
              count += 1;
              return Promise.resolve();
            }, function() {
              return Promise.resolve(count);
            }, { by: 1 })
            .then(done)
            .catch(done);
          });
        });

        it('can have sync changeWatcher and async changer function', function(done) {
          var count = 0;
          var User = {
            create: function() {
              return new Promise(function(resolve) {
                setTimeout(function() {
                  count += 1;
                  resolve();
                }, 5);
              });
            },
            count: function() {
              return count;
            },
          };

          test(function() {
            return User.create({name: 'bob'});
          }, function() {
            return User.count();
          }, {
            by: 1,
            callback: done
          });
        });

        it('can have async changeWatcher and sync changer function', function(done) {
          var count = 0;
          var User = {
            create: function() {
              count += 1;
            },
            count: function() {
              return new Promise(function(resolve) {
                setTimeout(function() {
                  resolve(count);
                }, 5);
              });
            },
          };

          test(function() {
            User.create({name: 'bob'});
          }, function() {
            return User.count();
          }, {
            by: 1,
            callback: done
          });
        });

        it('can have async changeWatcher and changer functions', function(done) {
          var User = userSetupAsync();

          test(function() {
            return User.create({name: 'bob'});
          }, function() {
            return User.count();
          }, {
            by: 1,
            callback: done
          });
        });

        it('works in passing cases without `callback` option', function() {
          var User = userSetupAsync();
          return test(function() {
            return User.create({name: 'bob'});
          }, function() {
            return User.count();
          }, {
            by: 1,
          });
        });

        it('works in failing cases without `callback` option', function() {
          var User = userSetupAsync();

          return assertRejected(/expected.+to change/, test(function() {
            return Promise.resolve();
          }, function() {
            return User.count();
          }, {
            by: 1,
          }));
        });

        it('rejects if affect rejects', function() {
          var User = userSetupAsync();

          return assertRejected(/fail/, test(function() {
            return Promise.reject(new Error('fail'));
          }, function() {
            return User.count();
          }, {
            by: 1,
          }));
        });

        it('rejects if changeWatcher rejects', function() {
          return assertRejected(/fail/, test(function() {
            return Promise.resolve();
          }, function() {
            return Promise.reject(new Error('fail'));
          }, {
            by: 1,
          }));
        });

        function userSetupAsync() {
          var count = 0;
          return {
            create: function() {
              return new Promise(function(resolve) {
                setTimeout(function() {
                  count += 1;
                  resolve();
                }, 5);
              });
            },
            count: function() {
              return new Promise(function(resolve) {
                setTimeout(function() {
                  resolve(count);
                }, 5);
              });
            },
          };
        }

        function assertRejected(matcher, p) {
          var rejected = false;

          return p.catch(function (err){
            rejected = true;
            expect(err.message).to.match(matcher);
          })
          .then(function (v) {
            if(!rejected) {
              throw Error('should have been rejected, but was resolved with: ' + v);
            }
            return v;
          });
        }
      });
    });
  }

  if(typeof module === 'undefined') {
    if(typeof define === 'function' && define.amd) {
      define([], function() {
        return sharedExamples;
      });
    } else {
      /* global window */
      window.sharedExamples = sharedExamples;
    }
  } else {
    module.exports = sharedExamples;
  }
})();
