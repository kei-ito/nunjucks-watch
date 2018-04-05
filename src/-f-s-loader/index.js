const path = require('path');
const fs = require('fs');

/**
 * Nunjucks' loader object
 * https://mozilla.github.io/nunjucks/api.html#loader
 */
exports.FSLoader = class FSLoader {

	/**
	 * @param {?Object} opts options.
	 * @param {number} opts.debounce debouncing time after file updates.
	 */
	constructor() {
		this.listeners = [];
		// This flag brings a callback to the second argument of getSource()
		this.async = true;
	}

	addListener(fn) {
		this.listeners.push(fn);
	}

	onDependency(filePath) {
		for (const fn of this.listeners) {
			fn(filePath);
		}
	}

	/**
	 * Read a file from the filePath.
	 * @param {string} filePath a path the loader loads data from.
	 * @param {function} callback a function called after loading.
	 * @return {void}
	 */
	getSource(filePath, callback) {
		this.onDependency(filePath);
		fs.readFile(filePath, (error, buffer) => {
			callback(error, buffer && {
				src: buffer.toString(),
				path: filePath,
				noCache: true,
			});
		});
	}

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
		const resolvedPath = path.join(path.dirname(parentFilePath), filePath);
		return resolvedPath;
	}

};
