'use strict';

const EventEmitter = require('events');


module.exports = class EmitProvider extends EventEmitter {

	$get() {
		let that = this;
		return function $emit(name, event) {
			that.emit(name, event);
		}
	}

}
