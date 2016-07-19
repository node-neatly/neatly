# Neatly

Neat, extensible and dead simple di system for nodejs.

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

const services = neatly.bootstrap(app).instances;

services.UserService.getById(1);

```


#Author

[@platdesign](https://twitter.com/platdesign)
