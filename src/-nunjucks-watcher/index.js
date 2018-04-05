const EventEmitter = require('events');
const nunjucks = require('nunjucks');
const writeFile = require('@nlib/write-file');
const chokidar = require('chokidar');
const {FSLoader} = require('../-f-s-loader');
const DEFAULT_DEBOUNCE_TIME = 100;

exports.NunjucksWatcher = class NunjucksWatcher extends EventEmitter {

	/**
	 * @param {Object} opts options.
	 * @param {String} opts.src A path to a nunjucks source.
	 * @param {?Object} opts.fsLoader An object passed to FSLoader.
	 * @param {?Object} opts.environment An object passsed to nunjucks.Environment.
	 * @param {?Object} opts.context An context object.
	 * @param {?String} opts.dest A path to write result.
	 * @param {?Boolean} opts.watch A flag to start watcher.
	 */
	constructor(opts = {}) {
		super();
		Object.assign(this, {
			debounce: DEFAULT_DEBOUNCE_TIME,
			context: {},
			watch: true,
		}, opts);
		this.loader = new FSLoader(opts.fsLoader);
		if (this.watch) {
			this.watcher = chokidar.watch(null, {
				ignoreInitial: true,
				awaitWriteFinish: {stabilityThreshold: this.debounce},
			})
			.on('all', () => {
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					const watching = this.watcher.getWatched();
					// Reset all watchers
					for (const directory of Object.keys(watching)) {
						for (const watchedFilePath of watching[directory]) {
							this.watcher.unwatch(watchedFilePath);
						}
					}
					// Start the renderer
					this.update();
				}, this.debounce);
			});
			this.loader.addListener((file) => this.watcher.add(file));
		}
		this.environment = new nunjucks.Environment(this.loader, opts.environment);
		this.update();
	}

	update() {
		return new Promise((resolve, reject) => this.environment.render(this.src, this.context, (error, result) => {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		}))
		.then((result) => this.dest ? writeFile(this.dest, result).then(() => result) : result)
		.then((result) => this.emit('update', result))
		.catch((error) => this.emit('error', error));
	}

	close() {
		if (this.watcher) {
			this.watcher.close();
		}
	}

};
