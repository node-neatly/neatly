'use strict';



function ExtendProvider() {

	const queues = {
		start: [],
		stop: []
	};



	this._runQueue = function(name) {

		// execute queue in a chain of promises
		return queues[name].reduce((acc, fn) => {
			return acc.then(() => fn());
		}, Promise.resolve())

		.then(() => delete queues[name]);
	};



	this.$get = function() {
		return function $ext(queueName, fn) {
			if (!queues.hasOwnProperty(queueName)) {
				throw new Error(`Extionsion point ${queueName} not available`);
			}
			queues[queueName].push(fn);
		};
	};

}


module.exports = ExtendProvider;
