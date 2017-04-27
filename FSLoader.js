const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const log = require('util').debuglog('nunjucks-watch');

/**
 * Nunjucks' loader object
 * https://mozilla.github.io/nunjucks/api.html#loader
 */
class FSLoader extends EventEmitter {

	/**
	 * @param {?Object} opts options.
	 * @param {number} opts.debounce debouncing time after file updates.
	 */
	constructor() {
		super();
		// This flag brings a callback to the second argument of getSource()
		this.async = true;
	}

	/**
	 * Read a file from the filePath.
	 * @param {string} filePath a path the loader loads data from.
	 * @param {function} callback a function called after loading.
	 * @return {void}
	 */
	getSource(filePath, callback) {
		log(`getSource: ${filePath}`);
		this.emit('dependency', filePath);
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
