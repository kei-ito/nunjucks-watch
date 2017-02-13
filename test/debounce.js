const assert = require('assert');
const debounce = require('../debounce');

describe('debounce', function () {

	it('should call the function after the last call', (done) => {
		const interval = 10;
		const execute = debounce((result) => {
			assert.equal(result, 0);
			done();
		}, interval * 2);
		let count = 10;
		const timer = setInterval(() => {
			if (0 < count--) {
				execute(count);
			} else {
				clearInterval(timer);
			}
		}, interval);
	});

});
