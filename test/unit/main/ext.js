'use strict';

const Code = require('code');
const expect = Code.expect;

module.exports = function(main) {

	describe('$ext', () => {

		describe('start', () => {

			const mod = main.module('app', []);

			mod.factory('test', function($ext) {

				let service = {};

				$ext('start', () => {
					return Promise.resolve()
						.then(() => service.started = true);
				});

				$ext('stop', () => {
					return Promise.resolve()
						.then(() => service.stopped = true);
				});

				service.extStartAgain = function() {
					$ext('start', function() {
						return new Promise((resolve) => setTimeout(resolve, 500));
					});
				};

				return service;

			});


			let app;
			before(() => {
				return main.bootstrap(mod)
					.then((res) => app = res);
			});



			it('bootstrapping should execute start queue', () => {

				expect(app.services.test.started)
					.to.equal(true);

			});



			it('should throw error on extend start-queue after bootstrapping', () => {

				expect(() => {
					app.services.test.extStartAgain();
				})
					.to.throw(Error, 'Extionsion point start not available');

			});



			it('app.stop() should run stop queue', () => {

				return app.stop()
					.then(() => {

						expect(app.services.test.stopped)
							.to.equal(true);

					});

			});


		});



	});


};
