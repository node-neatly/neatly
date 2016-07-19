'use strict';

// Deps
const createInjector = require('midge');
const ProvideService = require('./provide-service');
const ExtProvider = require('./ext-provider');

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



/**
 * Runs recursively through modules and their dependency-modules
 * and creates an array with args to process later by ProvideService-instance ($provide).
 * @param  {Object} module Module instance
 * @return {Array}        Array of objects containing register args.
 */
function createInvokeQueue(module) {

	return module.dependencies
		.map((sub) => {
			return createInvokeQueue(sub);
		})
		.reduce((acc, res) => {
			return acc.concat(res);
		}, [])
		.concat(module._invokeQueue);

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
function bootstrap(module) {

	const providerCache = {};
	const instanceCache = {};

	const providerInjector = createProviderInjector(providerCache);
	const instanceInjector = createInstanceInjector(instanceCache, providerInjector);

	providerCache.$provide = new ProvideService(providerCache, providerInjector, PROVIDER_SUFFIX);
	providerCache.$extProvider = new ExtProvider();

	instanceInjector.services =
		createInvokeQueue(module)
		.map((provideOn) => provideOn(providerInjector))
		.filter(Boolean)
		.reduce((acc, key) => {
			acc[key] = instanceInjector.get(key);
			return acc;
		}, {});


	instanceInjector.stop = function() {
		return providerCache.$extProvider._runQueue('stop');
	};

	return providerCache.$extProvider._runQueue('start')
		.then(() => instanceInjector);

}


module.exports = bootstrap;
