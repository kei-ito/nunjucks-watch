# nunjucks-watch

[![Build Status](https://travis-ci.org/kei-ito/nunjucks-watch.svg?branch=master)](https://travis-ci.org/kei-ito/nunjucks-watch)
[![Build status](https://ci.appveyor.com/api/projects/status/github/kei-ito/nunjucks-watch?branch=master&svg=true)](https://ci.appveyor.com/project/kei-ito/nunjucks-watch/branch/master)
[![codecov](https://codecov.io/gh/kei-ito/nunjucks-watch/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/nunjucks-watch)
[![dependencies Status](https://david-dm.org/kei-ito/nunjucks-watch/status.svg)](https://david-dm.org/kei-ito/nunjucks-watch)
[![devDependencies Status](https://david-dm.org/kei-ito/nunjucks-watch/dev-status.svg)](https://david-dm.org/kei-ito/nunjucks-watch?type=dev)

Auto updator for [Nunjucks](https://mozilla.github.io/nunjucks/).
It resolves location of dependents relative to the rendering target and watch them with [chokidar](https://github.com/paulmillr/chokidar).

## Install

```
npm install nunjucks-watch
```

## Usage

### Write result to a file

```javascript
const nunjucksWatch = require('nunjucks-watch');
const watcher = nunjucksWatch.watch({
	src: 'path/to/your/template.nunjucks',
	dest: 'path/to/dest.html',
	context: {
		foo: 'burn'
	}
});
```

### Receive result as a string

```javascript
const nunjucksWatch = require('nunjucks-watch');
const watcher = nunjucksWatch.watch({
	src: 'path/to/your/template.nunjucks',
	context: {
		foo: 'burn'
	}
})
	.on('update', function (rendered) {
		console.log(rendered);
	});
```

## API

### nunjucksWatch.watch(options)

Start an updator.

#### options

Type: `Object`

#### options.src

Type: `String` (required)

A path to a file to be rendered.

#### options.dest

Type: `String` (optional)

A path to which an updator will write the rendered text.

#### options.context

Type: `Object` (optional)

`options.context` will be used as a context object on [rendering](https://mozilla.github.io/nunjucks/api.html#render).
#### options.environment

Type: `Object` (optional)

`options.environment` will be passed to the [nunjucks.Environment](https://mozilla.github.io/nunjucks/api.html#constructor) constructor.

#### options.fsLoader.debounce

Type: `Number` (optional)

Time to wait for debouncing (milliseconds).

## License

MIT
