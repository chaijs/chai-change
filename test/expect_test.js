var expect = chai.expect;
describe('alter assertion enforces change',function() {

  var err = chai.assert.throws;

  describe("of any kind",function() {
    it("by throwing when alter doesn't occur",function() {
      err(function() {
        var value = "start";
        expect(function() {}).to.alter(function() {
          return value;
        });
      },"expected value to have changed from 'start'");
    });
    it("doesn't create false negatives",function() {
      var value = "start";
      expect(function() {
        value = "end";
      }).to.alter(function() {
        return value;
      });
    });
  });

  describe("from a specific value",function() {
    it("by throwing when value wasn't correct before",function() {
      err(function() {
        expect(function() {}).to.alter(function() {
          return "start";
        },{from: "fnord"});
      },"alters 'from' value wasn't equal to 'start'");
    });
    it("doesn't create false negatives",function() {
      var value = "start";
      expect(function() {
        value = "end";
      }).to.alter(function() {
        return value;
      },{from: "start"});
    });
  });

  describe("to a specific value",function() {
    it("by throwing when value doesn't alter to a specific value",function() {
      err(function() {
        var value = "start";
        expect(function() {
          value = "something else";
        }).to.alter(function() {
          return value;
        },{to: "end"});
      },"expected 'start' to change to 'end', instead changed to 'something else'");
    });
    it("doesn't create false negatives",function() {
      var value = "start";
      expect(function() {
        value = "end";
      }).to.alter(function() {
        return value;
      },{to: "end"});
    });
  });

  describe("by a specific amount",function() {
    it("by throwing",function() {
      err(function() {
        var value = 10;
        expect(function() {
          value = 15;
        }).to.alter(function() {
          return value;
        },{by: 10});
      },"expected 10 to change to 20, instead changed to 15");
    });
    it("doesn't create false negatives",function() {
      var value = 10;
      expect(function() {
        value = 20;
      }).to.alter(function() {
        return value;
      },{by: 10});

    });
    it("validates a numeric alter",function() {
      err(function() {
        expect(noop).to.alter(noop,{by: "fnord"});
      },'alters "by" assertions only work with numbers specified in "by" and or "from" options');
      err(function() {
        expect(noop).to.alter(noop,{by: 5,from:"fnord"});
      },'alters "by" assertions only work with numbers specified in "by" and or "from" options');
      function noop() {}
    });

  });

  describe("asynchronous support",function() {
    it("passes errors from getValue through to `callback:`",function() {
      expect(function() {
      }).to.alter(function(value) {
        value("value error");
      },{
        callback: callback
      });

      var heard;
      function callback(err) {
        heard = err;
      }
      chai.assert.equal(heard,"value error");
    });
    it("passes errors from alter through to `callback:`",function() {
      expect(function(done) {
        done("alter error");
      }).to.alter(function() {
      },{
        callback: callback
      });

      var heard;
      function callback(err) {
        heard = err;
      }
      chai.assert.equal(heard,"alter error");
    });
    it("can have synchronous getValue and async alter function",function(done) {
      var count = 0;
      var User = {
        create: function(attrs,cb) {
          setTimeout(function() {
            count += 1
            cb();
          })
        },
        count: function() { 
          return count;
        },
      };
      expect(function(done) {
        User.create({name: "bob"},done)
      }).to.alter(function() {
        return User.count();
      },{
        by: 1,
        callback: done
      });
    });
    it("can have asynchronous getValue and sync alter function",function(done) {
      var count = 0;
      var User = {
        create: function(attrs,cb) {
          count += 1
        },
        count: function(cb) {
          setTimeout(function() {
            cb(null,count);
          })
        },
      };
      expect(function() {
        User.create({name: "bob"})
      }).to.alter(function(value) {
        User.count(value);
      },{
        by: 1,
        callback: done
      });
    });
    it("can have asynchronous getValue and alter functions",function(done) {
      var count = 0;
      var User = {
        create: function(attrs,cb) {
          setTimeout(function() {
            count += 1
            cb();
          })
        },
        count: function(cb) {
          setTimeout(function() {
            cb(null,count);
          })
        },
      };
      expect(function(done) {
        User.create({name: "bob"},done)
      }).to.alter(function(value) {
        User.count(value);
      },{
        by: 1,
        callback: done
      });
    });
  })

  it("has working examples",function() {
    var x = 0;
    expect(function() { x += 1; }).to.alter(function() { return x });
   
    expect(function() {}).not.to.alter(function() { return x });
   
    expect(function() { x += 1 }).to.alter(function() { return x },{by: 1});
    expect(function() { x += 1 }).to.alter(function() { return x },{from: x});
    expect(function() { x += 1 }).to.alter(function() { return x },{from: x, to: x + 1});
    expect(function() { x += 1 }).to.alter(function() { return x },{to: x + 1});
  });

});
