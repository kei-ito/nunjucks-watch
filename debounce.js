/**
 * add a debouncer to a function
 * @param  {function} fn
 * @param  {number}   [delay=0]
 * @param  {*}  [thisArg=this]
 * @return {function}
 */
module.exports = function (fn, delay = 0, thisArg = this) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(function () {
			fn.call(thisArg, ...args);
		}, delay);
	};
};
