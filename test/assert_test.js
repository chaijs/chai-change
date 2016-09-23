var assert = chai.assert;
describe("assert interface",function() {

  it('provides alter and unaltered to enforce changes', function() {
    var value = "start";

    t(function() { assert.alters(changeValue("end"),getValue); });
    t(function() { assert.alters(changeValue("end"),getValue,{from: "start"}); });
    t(function() { assert.alters(changeValue("end"),getValue,{to: "end"}); });

    value = 10;
    assert.alters(changeValue(15),getValue,{by: 5});

    t(function() { assert.unaltered(noop,getValue) });
    t(function() { assert.unaltered(noop,getValue,{from: "start"}) });

    t(function() { assert.unaltered(noop,getValue,{to: "whevil"}) });
   
    // test examples
    var x = 0;
    assert.alters(function() { x += 1; },function() { return x });
 
    assert.unaltered(function() {},function() { return x });
 
    assert.alters(function() { x += 1 },function() { return x },{by: 1});
    assert.alters(function() { x += 1 },function() { return x },{from: x});
    assert.alters(function() { x += 1 },function() { return x },{from: x, to: x + 1});
    assert.alters(function() { x += 1 },function() { return x },{to: x + 1});

    var x = 0;
    assert.unaltered(doesNothing,function() { return x });
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

