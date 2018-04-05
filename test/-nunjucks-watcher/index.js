const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const test = require('@nlib/test');
const {promisify} = require('@nlib/util');

const readFile = promisify(fs.readFile, fs);
const utimes = promisify(fs.utimes, fs);
const {watch} = require('../..');
const startedTime = Date.now();
const rendered = `<!doctype html>
<meta charset="utf-8">

<link rel="stylesheet" href="css/index.css">


<script src="js/index.js"></script>

<script type="text/plain">${startedTime}</script>
`;

test('NunjucksWatcher', (test) => {

	const projectsDir = path.join(__dirname, '../projects');

	test('should render a template', (test) => {
		const targetDir = path.join(projectsDir, '001');
		const watcher = watch({
			src: path.join(targetDir, 'index.nunjucks'),
			context: {currentTime: startedTime},
		});
		test.watchers = [watcher];
		return new Promise((resolve, reject) => {
			watcher
			.once('error', reject)
			.once('update', resolve);
		})
		.then((result) => {
			test.compare(result, rendered);
			return new Promise((resolve, reject) => {
				watcher.once('update', resolve);
				utimes(path.join(targetDir, 'layout.nunjucks'), new Date(), new Date()).catch(reject);
			});
		});
	});

	test('should write the result to dest', (test) => {
		const targetDir = path.join(projectsDir, '001');
		const destPath = path.join(targetDir, 'output.txt');
		return new Promise((resolve, reject) => {
			let timer;
			const watcher = chokidar.watch(destPath)
			.once('error', reject)
			.on('all', () => {
				clearTimeout(timer);
				timer = setTimeout(resolve, 50);
			});
			test.watchers = [
				watcher,
				watch({
					src: path.join(targetDir, 'index.nunjucks'),
					dest: destPath,
					context: {currentTime: startedTime},
				})
				.once('error', reject),
			];
		})
		.then(() => readFile(destPath, 'utf8'))
		.then((result) => test.compare(result, rendered));
	}, {timeout: 5000});

	test('should close the watcher', (test) => {
		const targetDir = path.join(projectsDir, '001');
		const watcher = watch({
			src: path.join(targetDir, 'index.nunjucks'),
			context: {currentTime: startedTime},
		});
		test.watchers = [watcher];
		test('start', (test) => {
			return new Promise((resolve, reject) => {
				watcher
				.once('error', reject)
				.once('update', resolve);
			})
			.then((result) => test.compare(result, rendered))
			.then(() => Promise.all([
				new Promise((resolve) => watcher.once('update', resolve)),
				utimes(path.join(targetDir, 'layout.nunjucks'), new Date(), new Date()),
			]))
			.then((result) => test.compare(result[0], rendered));
		});
		test('close', () => {
			watcher.close();
			return Promise.all([
				new Promise((resolve, reject) => {
					watcher.once('update', () => reject(new Error('Updated unexpectedly')));
					setTimeout(resolve, 200);
				}),
				utimes(path.join(targetDir, 'layout.nunjucks'), new Date(), new Date()),
			]);
		});
	});

}, {
	hooks: {
		afterEach(test) {
			if (test.watchers) {
				for (const watcher of test.watchers) {
					watcher.close();
				}
			}
		},
	},
});
