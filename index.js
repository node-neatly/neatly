'use strict';

const Module = require('./lib/module');
const bootstrap = require('./lib/bootstrap');


module.exports = {
	module: function(name, deps) {
		return new Module(name, deps);
	},
	bootstrap: (module, configHandler) => bootstrap(module).start(configHandler),
	init: (module) => bootstrap(module)
};
