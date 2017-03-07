const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const log = require('util').debuglog('nunjucks-watch');

const chokidar = require('chokidar');
const debounce = require('j1/debounce');
const isUndefined = require('j1/isUndefined');

const DEFAULT_DEBOUNCE_TIME = 100;

/**
 * Nunjucks' loader object
 * https://mozilla.github.io/nunjucks/api.html#loader
 */
class FSLoader extends EventEmitter {

	/**
	 * @param {?Object} opts options.
	 * @param {number} opts.debounce debouncing time after file updates.
	 */
	constructor(opts = {}) {
		super();
		// This flag brings a callback to the second argument of getSource()
		if (isUndefined(opts.debounce)) {
			opts.debounce = DEFAULT_DEBOUNCE_TIME;
		}
		this.async = true;
		this.watcher = chokidar.watch(null, {ignoreInitial: true})
			.on('all', debounce((eventType, filePath) => {
				log(eventType, filePath);
				const watching = this.watcher.getWatched();
				// Reset all watchers
				for (const directory of Object.keys(watching)) {
					watching[directory].forEach((watchedFilePath) => {
						this.watcher.unwatch(watchedFilePath);
					});
				}
				// Start the renderer
				this.emit('update');
			}, opts.debounce));
	}

	/**
	 * Read a file from the filePath.
	 * @param {string} filePath a path the loader loads data from.
	 * @param {function} callback a function called after loading.
	 * @return {void}
	 */
	getSource(filePath, callback) {
		log(`getSource: ${filePath}`);
		this.watcher.add(filePath);
		fs.readFile(filePath, (error, buffer) => {
			callback(error, buffer && {
				src: buffer.toString(),
				path: filePath,
				noCache: true
			});
		});
	}

	/* eslint-disable class-methods-use-this */
	/**
	 * Called before getSource().
	 * Checks the first argument is a relative path or not.
	 * @param {string} filePath a path to check.
	 * @return {boolean} true: the first argument is a relative path.
	 */
	isRelative(filePath) {
		return !path.isAbsolute(filePath);
	}

	/**
	 * Called when isReative() above returns true.
	 * @param {string} parentFilePath a path where the filePath is resolved from.
	 * @param {string} filePath a path to be resolved.
	 * @return {string} a path to file.
	 */
	resolve(parentFilePath, filePath) {
		log(`resolve: ${filePath} from ${parentFilePath}`);
		const resolvedPath = path.join(path.dirname(parentFilePath), filePath);
		return resolvedPath;
	}
	/* eslint-enable class-methods-use-this */

}

module.exports = FSLoader;
