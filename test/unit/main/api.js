'use strict';

const CWD = process.cwd();
const Code = require('code');
const expect = Code.expect;
const path = require('path');

const Module = require(path.join(CWD, 'lib', 'module'));


module.exports = function(main) {

	describe('api', () => {

		it('should have method: module(name, deps)', () => {

			expect(main.module)
				.to.be.a.function();

		});

		it('should have method: bootstrap(module)', () => {

			expect(main.bootstrap)
				.to.be.a.function();

		});


		describe('module(name, deps)', () => {

			let mod;

			beforeEach(() => {
				mod = main.module('test');
			});

			it('should return an instance of Module', () => {

				expect(mod)
					.to.be.an.object()
					.and.an.instanceOf(Module);

			});

		});


	});

};
