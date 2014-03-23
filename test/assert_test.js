var assert = chai.assert;
describe("assert interface",function() {

  it('provides change and noChange to enforce changes', function() {
    var value = "start";

    t(function() { assert.change(changeValue("end"),getValue); });
    t(function() { assert.change(changeValue("end"),getValue,{from: "start"}); });
    t(function() { assert.change(changeValue("end"),getValue,{to: "end"}); });

    value = 10;
    assert.change(changeValue(15),getValue,{by: 5});

    t(function() { assert.noChange(noop,getValue) });
    t(function() { assert.noChange(noop,getValue,{from: "start"}) });

    t(function() { assert.noChange(noop,getValue,{to: "whevil"}) });
   
    // test examples
    var x = 0;
    assert.change(function() { x += 1; },function() { return x });
 
    assert.noChange(function() {},function() { return x });
 
    assert.change(function() { x += 1 },function() { return x },{by: 1});
    assert.change(function() { x += 1 },function() { return x },{from: x});
    assert.change(function() { x += 1 },function() { return x },{from: x, to: x + 1});
    assert.change(function() { x += 1 },function() { return x },{to: x + 1});

    var x = 0;
    assert.noChange(doesNothing,function() { return x });
    function doesNothing() {}
   

    function getValue() {
      return value;
    }
    function changeValue(to) {
      return function() {
        value = to;
      }
    }
    function t(testFn) {
      testFn();
      value = "start";
    }
    function noop() {}
  });

});

