'use strict';


const CWD = process.cwd();
const Code = require('code');
const expect = Code.expect;
const path = require('path');

const Module = require(path.join(CWD, 'lib', 'module'));


describe('Module', () => {

	describe('instance', () => {

		let mod;

		beforeEach(() => {

			mod = new Module('test');

		});

		it('should have method: service()', () => {

			expect(mod.service)
				.to.be.a.function();

		});

		it('should have method: factory()', () => {

			expect(mod.factory)
				.to.be.a.function();

		});

		it('should have method: value()', () => {

			expect(mod.value)
				.to.be.a.function();

		});

		it('should have method: provider()', () => {

			expect(mod.provider)
				.to.be.a.function();

		});


		it('should have attribute: dependencies', () => {

			expect(mod.dependencies)
				.to.be.an.array();

		});


		it('should have private attribute: _invokeQueue', () => {

			expect(mod._invokeQueue)
				.to.be.an.array();

		});



	});


});
