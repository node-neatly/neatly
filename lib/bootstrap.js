'use strict';

// Deps
const createInjector = require('midge');
const ProvideService = require('./provide-service');
const ExtProvider = require('./$ext-provider');
const EmitProvider = require('./$emit-provider');


/**
 * Suffix which will be appended to the name of each provider.
 * @type {String}
 */
const PROVIDER_SUFFIX = 'Provider';



/**
 * ProviderInjector holds the providers with a $get attribute
 * @param  {Object} cache providerCache
 * @return {Object}       created injector instance
 */
function createProviderInjector(cache) {
	const injector = createInjector(cache, function(name) {
		throw new Error(`Unknown provider: ${name}`);
	});

	injector.cache = cache;

	cache.$injector = injector;

	return injector;
}



/**
 * InstanceInjector holds provider-factory-instances or
 * loads constructor from providerInjector and instantiates $get-factory
 * @param  {Object} cache            instanceCache
 * @param  {Object} providerInjector ProviderInjector-instance
 * @return {Object}                  created injector instance
 */
function createInstanceInjector(cache, providerInjector) {
	const injector = createInjector(cache, function(servicename) {
		let provider = providerInjector.get(servicename + PROVIDER_SUFFIX);
		return injector.invoke(provider.$get, provider);
	});

	cache.$injector = injector;

	return injector;
}



function getModulesInOrder(module) {
	return module.dependencies
		.map((sub) => getModulesInOrder(sub))
		.reduce((acc, res) => acc.concat(res), [])
		.concat([module]);
}



/**
 * Runs recursively through modules and their dependency-modules
 * and creates an array with args to process later by ProvideService-instance ($provide).
 * @param  {Object} module Module instance
 * @return {Array}        Array of objects containing register args.
 */
function createInvokeQueue(modules) {

	return modules
		.map((mod) => mod._invokeQueue)
		.reduce((acc, res) => acc.concat(res), []);

}



/**
 * Runs through modules and returns an array of config handlers.
 * They will be in reversed order of modules order.
 * Config execution order:
 * Module-A depends on Module-B: [config-B, config-A]
 *
 * @param  {Array} modules Modules
 * @return {Array}         configQueue of all modules
 */
function createConfigQueue(modules) {

	return modules
		.map((mod) => mod._configQueue)
		.reduce((acc, res) => res.concat(acc), []);

}



/**
 * Runs recursively through modules and their dependency-modules
 * and creates an array with handlers to invoke later by app-instance after startup.
 * @param  {Object} module Module instance
 * @return {Array}        Array of run handlers.
 */
function createRunQueue(modules) {

	return modules
		.map((mod) => mod._runQueue)
		.reduce((acc, res) => acc.concat(res), []);

}



/**
 * Bootstraps a given module and its dependencies by registering
 * providers, services, factories, values and constants at in providerCache.
 * After registration all services will be injected and added as
 * instances attribute to instanceInjector.
 *
 * @param  {Object} module Main Module instance
 * @return {Object}        instanceInjector which holds all instances and methods: get, invoke, instantiate
 */
module.exports = function bootstrap(module) {

	const providerCache = {};
	const instanceCache = {};

	const providerInjector = createProviderInjector(providerCache);
	const instanceInjector = createInstanceInjector(instanceCache, providerInjector);

	providerCache.$provide = new ProvideService(providerCache, instanceCache, providerInjector, PROVIDER_SUFFIX);
	providerCache.$extProvider = new ExtProvider();


	let modules = getModulesInOrder(module);


	// Execute invokeQueue
	let provides = createInvokeQueue(modules)
		.map((provideOn) => provideOn(providerInjector))
		.filter(Boolean);


	// Execute configQueue
	createConfigQueue(modules).map((provideOn) => provideOn(providerInjector));

	return {
		injector: providerInjector,
		get: (provider) => providerInjector.get(provider),
		start: function start(configHandler) {

			if(configHandler) {
				providerInjector.invoke(configHandler);
			}

			// Init EmitProvider
			providerCache.$emitProvider = new EmitProvider();


			// Bind $on to instanceInjector (app-instance)
			instanceInjector.$on = providerCache.$emitProvider.on.bind(providerCache.$emitProvider);


			// Instantiate every service
			instanceInjector.services = provides
				.reduce((acc, key) => {
					let service = acc[key] = instanceInjector.get(key);
					if(service === undefined || service === null) {
						throw new Error(`Factory result of '${key}' can't be empty`);
					}
					return acc;
				}, {});


			instanceInjector.stop = function() {
				return providerCache.$extProvider._runQueue('stop');
			};

			// return Promise.resolve()
			// 	// Execute runQueue
			// 	.then(() => createRunQueue(modules).forEach((handler) => instanceInjector.invoke(handler)))

			// 	// Execute start queue
			// 	.then(() => providerCache.$extProvider._runQueue('start'))

			// 	// Return instanceInjector
			// 	.then(() => instanceInjector);

			return providerCache.$extProvider._runQueue('start')
				// Execute runQueue
				.then(() => createRunQueue(modules).forEach((handler) => instanceInjector.invoke(handler)))
				.then(() => instanceInjector);
		}
	};



};
