const EventEmitter = require('events');
const nunjucks = require('nunjucks');

const FSLoader = require('./FSLoader');

/**
 * NunjucksWatcher object
 */
class NunjucksWatcher extends EventEmitter {

	/**
	 * @param {string} targetFile
	 * @param {?Object} opts
	 * @param {?Object} opts.fsLoader
	 * @param {?Object} opts.environment
	 * @param {?Object} opts.context
	 */
	constructor (targetFile, opts = {}) {
		super();
		this.loader = new FSLoader(opts.fsLoader);
		this.environment = new nunjucks.Environment(this.loader, opts.environment);
		this.loader
			.on('update', () => {
				this.environment.render(targetFile, opts.context, (error, result) => {
					if (error) {
						this.emit('error', error);
					} else {
						this.emit('update', result);
					}
				});
			})
			.emit('update');
	}

}

exports.watch = (...args) => {
	return new NunjucksWatcher(...args);
};
exports.NunjucksWatcher = NunjucksWatcher;
