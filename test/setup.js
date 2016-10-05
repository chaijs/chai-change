var changes = require("../src/plugin.js");
global.chai = require("chai");
require('es6-promise').polyfill();
chai.use(changes);
