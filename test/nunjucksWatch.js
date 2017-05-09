const assert = require('assert');
const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');
const debounce = require('j1/debounce');
const promisify = require('j1/promisify');

const readFile = promisify(fs.readFile, fs);
const utimes = promisify(fs.utimes, fs);
const nunjucksWatch = require('..');
const currentTime = Date.now();
const rendered = `<!doctype html>
<meta charset="utf-8">

<link rel="stylesheet" href="css/index.css">


<script src="js/index.js"></script>

<script type="text/plain">${currentTime}</script>
`;

describe('nunjucksWatch', function () {
	let watcher = null;

	afterEach(function () {
		if (watcher) {
			watcher.close();
		}
	});

	it('should render a template', async function () {
		const targetDir = path.join(__dirname, '001');
		watcher = nunjucksWatch.watch({
			watch: true,
			src: path.join(targetDir, 'index.nunjucks'),
			context: {currentTime: currentTime}
		});
		const result = await new Promise((resolve, reject) => {
			watcher
				.once('error', reject)
				.once('update', resolve);
		});
		assert.equal(result, rendered);
		return new Promise((resolve, reject) => {
			watcher.once('update', resolve);
			utimes(path.join(targetDir, 'layout.nunjucks'), NaN, NaN)
				.catch(reject);
		});
	});

	it('should write the result to dest', async function () {
		const targetDir = path.join(__dirname, '001');
		const destPath = path.join(targetDir, 'output.txt');
		const TIME_LIMIT_TO_COMPILE = 5000;
		const DEBOUNCE_TIME = 50;
		/* eslint-disable no-invalid-this */
		this.timeout(TIME_LIMIT_TO_COMPILE);
		/* eslint-enable no-invalid-this */
		await new Promise((resolve, reject) => {
			watcher = chokidar.watch(destPath)
			.once('error', reject)
			.on('all', debounce(resolve, DEBOUNCE_TIME));
			nunjucksWatch.watch({
				watch: true,
				src: path.join(targetDir, 'index.nunjucks'),
				dest: destPath,
				context: {currentTime}
			})
			.once('error', reject);
		});
		const result = await readFile(destPath, 'utf8');
		assert.equal(result, rendered);
	});

	it('should close the watcher', async function () {
		const targetDir = path.join(__dirname, '001');
		watcher = nunjucksWatch.watch({
			watch: true,
			src: path.join(targetDir, 'index.nunjucks'),
			context: {currentTime}
		});
		const TIME_TO_WAIT = 200;
		let result = await new Promise((resolve, reject) => {
			watcher
			.once('error', reject)
			.once('update', resolve);
		});
		assert.equal(result, rendered);
		[result] = await Promise.all([
			new Promise((resolve) => {
				watcher.once('update', resolve);
			}),
			utimes(path.join(targetDir, 'layout.nunjucks'), NaN, NaN)
		]);
		assert.equal(result, rendered);
		watcher.close();
		await Promise.all([
			new Promise((resolve, reject) => {
				watcher.once('update', () => {
					reject(new Error('Updated unexpectedly'));
				});
				setTimeout(resolve, TIME_TO_WAIT);
			}),
			utimes(path.join(targetDir, 'layout.nunjucks'), NaN, NaN)
		]);
	});
});
