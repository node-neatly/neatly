'use strict';


function Module(name, deps) {

	const that = this;

	// Will be processed on bootstrap.
	const invokeQueue = this._invokeQueue = [];
	const runQueue = this._runQueue = [];

	// Holds the deps of this module
	this.dependencies = deps || [];


	/**
	 * Helper to create a function which adds a provide-method to invokeQueue.
	 * @param  {String} providerName $provide | $injector
	 * @param  {String} method       method to execute on provider
	 * @param  {String} insertMethod native array-methods (default: push)
	 * @return {Object}              self
	 */
	function createQueuePusher(providerName, method, insertMethod) {
		return function() {
			let args = arguments;

			// Add provide method to invokeQueue to execute it on bootstrap.
			invokeQueue[insertMethod || 'push'](function provide(injector) {

				// Get provider
				let provider = injector.get(providerName);

				// Execute method on provider
				provider[method].apply(provider, args);

				// Return name in case of provider, factory, service, value or constant
				if (providerName === '$provide') {
					return args[0];
				}

			});

			return that;
		};
	}


	// Add provide methods to module instance

	this.provider = createQueuePusher('$provide', 'provider');

	this.factory = createQueuePusher('$provide', 'factory');

	this.service = createQueuePusher('$provide', 'service');

	this.value = createQueuePusher('$provide', 'value');

	this.config = createQueuePusher('$injector', 'invoke');

	this.constant = createQueuePusher('$provide', 'constant', 'unshift');

	this.run = function(handler) {
		runQueue.push(handler);
		return this;
	};
}


module.exports = Module;
