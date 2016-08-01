# Neatly

Neat, extensible and dead simple di system for nodejs.

[![Build Status](https://travis-ci.org/node-neatly/neatly.svg?branch=master)](https://travis-ci.org/node-neatly/neatly)


# Purpose

Isolate business-logic from server configuration.


# Install

`npm install --save neatly`

# Usage

```javascript
const neatly = require('neatly');
const dbModule = require('./your-db-module');

const app = neatly.module('app', [
	dbModule
]);

app.config(($dbProvider) => {

	$dbProvider.connect('localhost', 'my-app-db');

});

app.factory('UserService', ($db) => {

	return {
		getById: function(id) {
			return $db.User.getById(id);
		}
	}
});

neatly.bootstrap(app)
	.then((instance) => {
		instance.services.UserService.getById(1);
	});

```


#Author

[@platdesign](https://twitter.com/platdesign)
