const assert = require('assert');
const path = require('path');
const promisify = require('j1/promisify');

const FSLoader = require('../FSLoader');

describe('FSLoader', function () {

	const loader = new FSLoader();

	describe('isRelative', function () {

		[
			['./a', true],
			['b', false],
			['../c', true],
			['.../d', false]
		].forEach((test) => {
			it(`${test[0]} is${test[1] ? ' ' : ' not '}a relative path`, function () {
				assert.equal(loader.isRelative(test[0]), test[1]);
			});
		});

	});

	describe('resolve', function () {

		[
			['/a', './b', '/b'],
			['/a/b', './c', '/a/c'],
			['/a/b/c', '../d', '/a/d']
		].forEach((test) => {
			it(`should resolve ${test[1]} from ${test[0]}`, function () {
				assert.equal(loader.resolve(test[0], test[1]), test[2]);
			});
		});

	});

	describe('getSource', function () {

		it('should read file', function () {
			const filePath = loader.resolve(path.join(__dirname, 'test'), './001/index.nunjucks');
			return promisify(loader.getSource, loader)(filePath)
				.then((result) => {
					assert.deepEqual(result.src.toString().indexOf('{% extends "./layout.nunjucks" %}'), 0);
				});
		});

	});

});
