const EventEmitter = require('events');
const nunjucks = require('nunjucks');
const writeFile = require('j1/writeFile');

const FSLoader = require('./FSLoader');
const promisify = require('j1/promisify');

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
		this.loader = new FSLoader(opts.fsLoader);
		this.environment = new nunjucks.Environment(this.loader, opts.environment);
		this.environment.pRender = promisify(this.environment.render, this.environment);
		this.loader
			.on('update', () => {
				this.environment.pRender(opts.src, opts.context)
					.then((result) => {
						this.emit('update', result);
						if (opts.dest) {
							writeFile(opts.dest, result)
								.catch((error) => {
									this.emit('error', error);
								});
						}
					})
					.catch((error) => {
						this.emit('error', error);
					});
			})
			.emit('update');
	}

	close() {
		this.loader.watcher.close();
	}

}

exports.NunjucksWatcher = NunjucksWatcher;
exports.watch = (opts) => {
	return new NunjucksWatcher(opts);
};
