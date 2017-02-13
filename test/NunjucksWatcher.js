const assert = require('assert');
const fs = require('fs');
const path = require('path');
const nunjucksWatch = require('..');
const rendered = `<!doctype html>
<meta charset="utf-8">

<link rel="stylesheet" href="css/index.css">


<script src="js/index.js"></script>

`;

describe('NunjucksWatcher', function () {

	it('should render a template', function (done) {
		const targetDir = path.join(__dirname, '001');
		nunjucksWatch.watch(path.join(targetDir, 'index.nunjucks'))
			.once('error', done)
			.once('update', function (result) {
				assert.equal(result, rendered);
				this.once('update', () => {
					done();
				});
				fs.utimes(path.join(targetDir, 'layout.nunjucks'), NaN, NaN, (error) => {
					if (error) {
						done(error);
					}
				});
			});
	});

});
