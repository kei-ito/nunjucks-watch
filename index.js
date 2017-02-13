const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const nunjucks = require('nunjucks');
const mkdirp = require('mkdirp');

const FSLoader = require('./FSLoader');

/**
 * NunjucksWatcher object
 */
class NunjucksWatcher extends EventEmitter {

	/**
	 * @param {Object} opts
	 * @param {string} opts.src
	 * @param {?Object} opts.fsLoader
	 * @param {?Object} opts.environment
	 * @param {?Object} opts.context
	 * @param {?string} opts.dest
	 */
	constructor (opts = {}) {
		super();
		this.loader = new FSLoader(opts.fsLoader);
		this.environment = new nunjucks.Environment(this.loader, opts.environment);
		this.loader
			.on('update', () => {
				this.environment.render(opts.src, opts.context, (error, result) => {
					if (error) {
						this.emit('error', error);
					} else {
						this.emit('update', result);
						if (opts.dest) {
							mkdirp(path.dirname(opts.dest), (error) => {
								if (error) {
									this.emit('error', error);
								} else {
									fs.writeFile(opts.dest, result, (error) => {
										if (error) {
											this.emit('error', error);
										}
									});
								}
							});
						}
					}
				});
			})
			.emit('update');
	}

}

exports.NunjucksWatcher = NunjucksWatcher;
exports.watch = (opts) => {
	return new NunjucksWatcher(opts);
};
