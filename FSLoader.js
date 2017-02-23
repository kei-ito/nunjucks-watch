const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const log = require('util').debuglog('nunjucks-watch');

const chokidar = require('chokidar');
const debounce = require('@kei-ito/debounce');

/**
 * Nunjucks' loader object
 * https://mozilla.github.io/nunjucks/api.html#loader
 */
class FSLoader extends EventEmitter {

	/**
	 * @param {?Object} opts
	 * @param {number} opts.debounce debouncing time after file updates
	 */
	constructor (opts = {}) {
		super();
		// This flag brings a callback to the second argument of getSource()
		this.async = true;
		this.watcher = chokidar.watch(null, {
			ignoreInitial: true
		})
			.on('all', debounce((eventType, filePath) => {
				log(eventType, filePath);
				const watching = this.watcher.getWatched();
				// Reset all watchers
				for (const directory in watching) {
					watching[directory].forEach((watchedFilePath) => {
						this.watcher.unwatch(watchedFilePath);
					});
				}
				// Start the renderer
				this.emit('update');
			}, opts.debounce || 100));
	}

	/**
	 * Read a file from the filePath.
	 * @param {string} filePath
	 * @param {function} callback
	 * @return {void}
	 */
	getSource (filePath, callback) {
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

	/**
	 * Called before getSource().
	 * Checks the first argument is a relative path or not.
	 * @param {string} filePath
	 * @return {boolean}
	 */
	isRelative (filePath) {
		return /^\.\.?\//.test(filePath);
	}

	/**
	 * Called when isReative() above returns true.
	 * @param {string} parentFilePath
	 * @param {string} filePath
	 * @return {string}
	 */
	resolve (parentFilePath, filePath) {
		log(`resolve: ${filePath} from ${parentFilePath}`);
		const resolvedPath = path.join(path.dirname(parentFilePath), filePath);
		return resolvedPath;
	}

}

module.exports = FSLoader;
