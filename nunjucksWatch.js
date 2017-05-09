const EventEmitter = require('events');
const nunjucks = require('nunjucks');
const writeFile = require('j1/writeFile');

const FSLoader = require('./FSLoader');
const promisify = require('j1/promisify');
const chokidar = require('chokidar');
const debounce = require('j1/debounce');
const console = require('j1/console').create('nunjucks-watch');

const DEFAULT_DEBOUNCE_TIME = 100;

/**
 * NunjucksWatcher object
 */
class NunjucksWatcher extends EventEmitter {

	/**
	 * @param {Object} opts options.
	 * @param {string} opts.src A path to a nunjucks source.
	 * @param {?Object} opts.fsLoader An object passed to FSLoader.
	 * @param {?Object} opts.environment An object passsed to nunjucks.Environment.
	 * @param {?Object} opts.context An context object.
	 * @param {?string} opts.dest A path to write result.
	 */
	constructor(opts = {}) {
		super();
		Object.assign(this, {
			debounce: DEFAULT_DEBOUNCE_TIME,
			context: {}
		}, opts);
		this.loader = new FSLoader(opts.fsLoader);
		if (this.watch) {
			this.watcher = chokidar.watch(null, {
				ignoreInitial: true,
				awaitWriteFinish: {stabilityThreshold: this.debounce}
			})
			.on('all', debounce((eventType, filePath) => {
				console.debug(eventType, filePath);
				const watching = this.watcher.getWatched();
				// Reset all watchers
				for (const directory of Object.keys(watching)) {
					watching[directory].forEach((watchedFilePath) => {
						this.watcher.unwatch(watchedFilePath);
					});
				}
				// Start the renderer
				this.update();
			}, this.debounce));
			this.loader.on('dependency', (file) => {
				this.watcher.add(file);
			});
		}
		this.environment = new nunjucks.Environment(this.loader, opts.environment);
		this.update();
	}

	async update() {
		try {
			const render = promisify(this.environment.render, this.environment);
			const result = await render(this.src, this.context);
			if (this.dest) {
				await writeFile(this.dest, result);
			}
			this.emit('update', result);
		} catch (error) {
			this.emit('error', error);
		}
	}

	close() {
		if (this.watcher) {
			this.watcher.close();
		}
	}

}

exports.NunjucksWatcher = NunjucksWatcher;
exports.watch = (opts) => {
	return new NunjucksWatcher(opts);
};
