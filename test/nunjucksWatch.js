const assert = require('assert');
const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');
const debounce = require('@kei-ito/debounce');
const promisify = require('@kei-ito/promisify');

const readFile = promisify(fs.readFile, fs);
const nunjucksWatch = require('..');
const currentTime = Date.now();
const rendered = `<!doctype html>
<meta charset="utf-8">

<link rel="stylesheet" href="css/index.css">


<script src="js/index.js"></script>

<script type="text/plain">${currentTime}</script>
`;

describe('nunjucksWatch', function () {

	it('should render a template', function (done) {
		const targetDir = path.join(__dirname, '001');
		nunjucksWatch.watch({
			src: path.join(targetDir, 'index.nunjucks'),
			context: {
				currentTime: currentTime
			}
		})
			.once('error', done)
			.once('update', function (result) {
				assert.equal(result, rendered);
				this.once('update', () => {
					done();
				});
				fs.utimes(path.join(targetDir, 'layout.nunjucks'), NaN, NaN, (error) => {
					if (error) {
						done(error);
					}
				});
			});
	});

	it('should write the result to dest', function (done) {
		const targetDir = path.join(__dirname, '001');
		const destPath = path.join(targetDir, 'output.txt');
		nunjucksWatch.watch({
			src: path.join(targetDir, 'index.nunjucks'),
			dest: destPath,
			context: {
				currentTime: currentTime
			}
		})
			.once('error', done)
			.once('update', function () {
				const watcher = chokidar.watch(destPath)
					.once('error', (error) => {
						watcher.close();
						done(error);
					})
					.on('all', debounce(() => {
						watcher.close();
						readFile(destPath, 'utf8')
							.then((result) => {
								assert.equal(result, rendered);
								done();
							})
							.catch(done);
					}, 100));
			});
	});

});
