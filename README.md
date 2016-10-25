# Chai Change

[![Build Status](https://travis-ci.org/chaijs/chai-change.svg?branch=master)](https://travis-ci.org/chaijs/chai-change)

Assert that a change you expected to happen, happened, with this plugin for the [chai](http://github.com/logicalparadox/chai) assertion library. The plugin works in node and the browser, asynchronously or synchronously.

The idea of the plugin is to make your tests more robust. Rather than doing:

```javascript
users.create();
expect(users.count()).to.equal(1);
```

instead assert that the action actually causes the expected change

```javascript
expect(function() {
  users.create();
}).to.alter(users.count,{by: 1});
```

This is more robust as it avoids false positives: in this example, if `users.count()` was already 1 and `users.create()` was not implemented, the first example would still pass. Using the change expectation, since there was not a change `{by: 1}` from the starting value, the test would correctly fail.

## Installation

#### Node.js

`chai-change` is available on npm.

      $ npm install chai-change

#### Browser

Either install via npm, or [download `chai-change`](src/plugin.js) and save as `chai-change.js`. Then simply include after `chai.js`.

```xml
<script src="chai-change.js"></script>
```

## Plug In

If you are using `chai-change` in the browser, there is nothing you need to do.

If you are using node, you just need to tell `chai` about the plugin:

```js
var chai = require('chai');

chai.use(require('chai-change'));
```

## Expect API

### .change

Asserts that the value returned by function passed to `change()` changes after the function has run:

```javascript
var x = 0;

expect(function() { x += 1; }).to.alter(function() { return x });
expect(function() {     }).not.to.alter(function() { return x });
```

You can pass options to be specific about the changes expected. Use the `from` key to enforce a starting value, a `to` key for and ending value, and a
`by` key to enforce a numeric change.

```javascript
expect(function() { x += 1 }).to.alter(function() { return x },{by: 1});
expect(function() { x += 1 }).to.alter(function() { return x },{from: x});
expect(function() { x += 1 }).to.alter(function() { return x },{from: x, to: x + 1});
expect(function() { x += 1 }).to.alter(function() { return x },{to: x + 1});
```

## Assert API

### assert.alters

Asserts that the value returned by `getValue`
changes after the `affect` function has run:
                                                                                       
```javascript
var x = 0;
assert.alters(affect,getValue);

function affect() { x += 1; }
function getValue() { return x }
```
                                                                                       
You can pass options to be specific about the changes expected. Use the `from` 
key to enforce a starting value, a `to` key for and ending value, and a
`by` key to enforce a numeric change.
                                                                                       
```javascript
assert.alters(function() { x += 1 },function() { return x },{by: 1});
assert.alters(function() { x += 1 },function() { return x },{from: x});
assert.alters(function() { x += 1 },function() { return x },{from: x, to: x + 1});
assert.alters(function() { x += 1 },function() { return x },{to: x + 1});
```

### assert.unaltered

Asserts that the value returned by `getValue`
doesn't change after the `affect` has run:
                                                          
```javascript
var x = 0;
assert.unaltered(doesNothing,function() { return x });
function doesNothing() {}
```

## Asynchronous asserts

Both the `affect` and `getValue` callbacks can return a promise, or take a node-style callback, with `error` as the first parameter. If you provide a callback you need to give a final `callback:` option to the change assertion, that is used to notify your test runner that the test is complete.

### With error-first callback

```javascript
var count = 0;
var User = {
  create: function(attrs,cb) {
    setTimeout(function() {
      count += 1
      cb();
    });
  },
  count: function(cb) {
    setTimeout(function() {
      cb(null,count);
    });
  },
};

expect(function(stepDone) {
  User.create({name: "bob"},stepDone)
}).to.alter(function(stepDone) {
  User.count(stepDone);
},{
  by: 1,
  callback: done
});
```

### With promises (with promise aware test runner)

Many test runners - for instance [mocha](https://github.com/mochajs/mocha) - support simply returning promises from `it()` or `test()` blocks to support asynchronous tsts. chai-change supports this style:

```javascript

it("creates a user", function() {
  var count = 0;
  var User = {
    create: (attrs) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          count += 1
          resolve();
        });
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

  // when `affect` or `getValue` returns a promise the expectation will return a promise as well
  return expect(function() {
    return User.create({name: "bob"});
  }).to.alter(function() {
    return User.count();
  },{
    by: 1,
  });
})
```

## Tests

Node: `npm install && npm test`.

Browser: `npm install` then open `test/index.html`.

## Changelog

### 2.1

Promise support - thanks to (@talyssonoc)[https://github.com/talyssonoc]!

Both the `getValue` and `affect` functions can now return promises. The expectation also returns a promise when used with promises, which can be used directly with mocha etc.

### 2.0

- *BREAKING CHANGE* Change whole API from `change` to `alter` to avoid the `.change` method added to chai in `chai@2.0.0`.

