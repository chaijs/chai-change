# Chai Changes

Assert that a change you expected to happen, happened, with this plugin for the [chai](http://github.com/logicalparadox/chai) assertion library. 

The idea of the plugin is to make your tests more robust. Rather than doing:

```javascript
users.create();
expect(users.count()).to.equal(1);
```

instead assert that the action actually causes the expected change

```javascript
expect(function() {
  users.create();
}).to.change(users.count,{by: 1});
```

This is more robust as it avoids false positives: in this example, if `users.count()` was already 1 and `users.create()` was not implemented, the first example would still pass. Using the change expectation, since there was not a change `{by: 1}` from the starting value, the test would correctly fail.

## Installation

#### Node.js

`chai-changes` is available on npm.

      $ npm install chai-changes

#### Browser

Either install via npm, or (download `chai-changes`)[src/plugin.js] and save as `chai-changes.js`. Then simply include after `chai.js`.

```xml
<script src="chai-changes.js"></script>
```

## Plug In

If you are using `chai-changes` in the browser, there is nothing you need to do.

If you are using node, you just need to tell `chai` about the plugin:

```js
var chai = require('chai');

chai.use(require('chai-changes'));
```

## Expect API

### .change

Asserts that the value returned by `getValue` changes after the function has run:

```javascript
var x = 0;
expect(function() { x += 1; }).to.change(function() { return x });

expect(function() {}).not.to.change(function() { return x });
```

You can pass options to be specific about the changes expected. Use the `from` key to enforce a starting value, a `to` key for and ending value, and a
`by` key to enforce a numeric change.

```javascript
expect(function() { x += 1 }).to.change(function() { return x },{by: 1});
expect(function() { x += 1 }).to.change(function() { return x },{from: x});
expect(function() { x += 1 }).to.change(function() { return x },{from: x, to: x + 1});
expect(function() { x += 1 }).to.change(function() { return x },{to: x + 1});
```

## Assert API

### assert.change

Asserts that the value returned by `getValue`
changes after the `affect` function has run:
                                                                                       
```javascript
var x = 0;
assert.change(function() { x += 1; },function() { return x });
```
                                                                                       
You can pass options to be specific about the changes expected. Use the `from` 
key to enforce a starting value, a `to` key for and ending value, and a
`by` key to enforce a numeric change.
                                                                                       
```javascript
assert.change(function() { x += 1 },function() { return x },{by: 1});
assert.change(function() { x += 1 },function() { return x },{from: x});
assert.change(function() { x += 1 },function() { return x },{from: x, to: x + 1});
assert.change(function() { x += 1 },function() { return x },{to: x + 1});
```

### assert.noChange

Asserts that the value returned by `getValue`
doesn't change after the `affect` has run:
                                                          
```javascript
var x = 0;
assert.noChange(doesNothing,function() { return x });
function doesNothing() {}
```

## Tests

Just `npm install && mocha`.

