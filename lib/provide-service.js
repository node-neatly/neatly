'use strict';


class ProvideService {



	/**
	 * Creates a $provide instance which registers
	 * services, factories, providers, values, constants
	 * on given cache.
	 *
	 * @param  {Object} cache           providerCache
	 * @param  {Object} injector        providerInjector
	 * @param  {String} PROVIDER_SUFFIX suffix for provider names
	 */
	constructor(providerCache, instanceCache, injector, PROVIDER_SUFFIX) {

		this._PROVIDER_SUFFIX = PROVIDER_SUFFIX;
		this._injector = injector;
		this._providerCache = providerCache;
		this._instanceCache = instanceCache;

	}



	/**
	 * Registers a provider instance or instantiates a given constructor.
	 * Provider-Instance needs to have a $get-attribute which will hold the
	 * factory for instantiating the service-instance.
	 * Provider instance will be added to _providerCache object.
	 *
	 * @param  {String} name     Provider-Name which will be extended by PROVIDER_SUFFIX
	 * @param  {Object|Class|Constructor} Instance or constructor which will be instantiated directly.
	 * @return {Object}          provider instance
	 */
	provider(name, provider) {

		if (typeof provider === 'function' || Array.isArray(provider)) {
			provider = this._injector.instantiate(provider);
		}

		if (!provider.$get) {
			throw new Error(`Provider ${name} must define $get factory method.`);
		}

		return (this._providerCache[name + this._PROVIDER_SUFFIX] = provider);

	}



	/**
	 * Registers a provider with given factoryFn as $get-attribute
	 * @param  {String} name      name of the factory
	 * @param  {Function} factoryFn invokeable function which will be injected when instantiating the service
	 * @return {Object}           provider
	 */
	factory(name, factoryFn) {
		return this.provider(name, {
			$get: factoryFn
		});
	}



	/**
	 * Registers a factory which instantiates given constructor as service-instance.
	 * @param  {String} name        name of the service
	 * @param  {Constructor|Class} constructor constructable object
	 * @return {Object}             provider
	 */
	service(name, constructor) {
		return this.factory(name, function($injector) {
			return $injector.instantiate(constructor);
		});
	}



	/**
	 * Registers a factory which returns given value as service-instance.
	 * @param  {String} name  name of the value
	 * @param  {Any} value 		any value which should be returned as service-instance
	 * @return {Object}       provider
	 */
	value(name, value) {
		return this.factory(name, function() {
			return value;
		});
	}



	/**
	 * Adds given value to cache. Can be accessed through name and name + PROVIDER_SUFFIX
	 * @param  {String} name  name of constant
	 * @param  {Any} value 		value to provide
	 * @return {Void}
	 */
	constant(name, value) {
		this._providerCache[name] = this._instanceCache[name] = value;
	}



}


module.exports = ProvideService;
