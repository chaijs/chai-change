var expect = chai.expect;
describe('change assertion enforces changes',function() {

  var err = chai.assert.throws;

  describe("of any kind",function() {
    it("by throwing when change doesn't occur",function() {
      err(function() {
        var value = "start";
        expect(function() {}).to.change(function() {
          return value;
        });
      },"expected value to have changed from 'start'");
    });
    it("doesn't create false negatives",function() {
      var value = "start";
      expect(function() {
        value = "end";
      }).to.change(function() {
        return value;
      });
    });
  });

  describe("from a specific value",function() {
    it("by throwing when value wasn't correct before",function() {
      err(function() {
        expect(function() {}).to.change(function() {
          return "start";
        },{from: "fnord"});
      },"change 'from' value wasn't equal to 'start'");
    });
    it("doesn't create false negatives",function() {
      var value = "start";
      expect(function() {
        value = "end";
      }).to.change(function() {
        return value;
      },{from: "start"});
    });
  });
  describe("to a specific value",function() {
    it("by throwing when value doesn't change to a specific value",function() {
      err(function() {
        var value = "start";
        expect(function() {
          value = "something else";
        }).to.change(function() {
          return value;
        },{to: "end"});
      },"expected 'start' to change to 'end', instead changed to 'something else'");
    });
    it("doesn't create false negatives",function() {
      var value = "start";
      expect(function() {
        value = "end";
      }).to.change(function() {
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
        }).to.change(function() {
          return value;
        },{by: 10});
      },"expected 10 to change to 20, instead changed to 15");
    });
    it("doesn't create false negatives",function() {
      var value = 10;
      expect(function() {
        value = 20;
      }).to.change(function() {
        return value;
      },{by: 10});

    });
    it("validates a numeric change",function() {
      err(function() {
        expect(noop).to.change(noop,{by: "fnord"});
      },'change "by" assertions only work with numbers specified in "by" and or "from" options');
      err(function() {
        expect(noop).to.change(noop,{by: 5,from:"fnord"});
      },'change "by" assertions only work with numbers specified in "by" and or "from" options');
      function noop() {}
    });

  });

  describe("asynchronous support",function() {
    it("passes errors from getValue through to `callback:`",function() {
      expect(function() {
      }).to.change(function(value) {
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
    it("passes errors from change through to `callback:`",function() {
      expect(function(done) {
        done("change error");
      }).to.change(function() {
      },{
        callback: callback
      });

      var heard;
      function callback(err) {
        heard = err;
      }
      chai.assert.equal(heard,"change error");
    });
    it("can have synchronous getValue and async change function",function(done) {
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
      }).to.change(function() {
        return User.count();
      },{
        by: 1,
        callback: done
      });
    });
    it("can have asynchronous getValue and sync change function",function(done) {
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
      }).to.change(function(value) {
        User.count(value);
      },{
        by: 1,
        callback: done
      });
    });
    it("can have asynchronous getValue and change functions",function(done) {
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
      }).to.change(function(value) {
        User.count(value);
      },{
        by: 1,
        callback: done
      });
    });
  })

  it("has working examples",function() {
    var x = 0;
    expect(function() { x += 1; }).to.change(function() { return x });
   
    expect(function() {}).not.to.change(function() { return x });
   
    expect(function() { x += 1 }).to.change(function() { return x },{by: 1});
    expect(function() { x += 1 }).to.change(function() { return x },{from: x});
    expect(function() { x += 1 }).to.change(function() { return x },{from: x, to: x + 1});
    expect(function() { x += 1 }).to.change(function() { return x },{to: x + 1});
  });

});
