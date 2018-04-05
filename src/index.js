Object.assign(
	exports,
	require('./-nunjucks-watcher'),
	require('./-f-s-loader'),
	{watch: (opts) => new exports.NunjucksWatcher(opts)}
);
