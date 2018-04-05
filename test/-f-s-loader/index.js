const assert = require('assert');
const test = require('@nlib/test');
const {promisify} = require('@nlib/util');
const {FSLoader} = require('../..');
const loader = new FSLoader();
loader.getSource = promisify(loader.getSource);

test('FSLoader', (test) => {

	test('isRelative', (test) => {
		for (const [pattern, expected] of [
			['./a', true],
			['b', true],
			['../c', true],
			['/d', false],
		]) {
			test(`${pattern} is${expected ? ' ' : ' not '}a relative path`, () => {
				assert.equal(loader.isRelative(pattern), expected);
			});
		}
	});

	test('resolve', (test) => {
		for (const [pattern, from, expected] of [
			['/a', './b', '/b'],
			['/a/b', './c', '/a/c'],
			['/a/b/c', '../d', '/a/d'],
		]) {
			test(`should resolve ${pattern} from ${from}`, () => {
				assert.equal(loader.resolve(pattern, from), expected);
			});
		}
	});

	test('getSource', (test) => {
		test('should read file', () => {
			const filePath = loader.resolve(__dirname, 'projects/001/index.nunjucks');
			return loader.getSource(filePath)
			.then(({src}) => {
				assert.deepEqual(`${src}`.indexOf('{% extends "./layout.nunjucks" %}'), 0);
			});
		});
	});

});
