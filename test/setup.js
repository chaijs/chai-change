var chai = global.chai = require('chai');
global.sharedExamples = require('./sharedExamples');
var changes = require('../src/plugin.js');
require('es6-promise').polyfill();
chai.use(changes);
