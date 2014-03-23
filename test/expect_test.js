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
