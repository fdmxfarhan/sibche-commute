var locale 			= require("locale");
var ejs 				= require('ejs');
var _ 				= require('lodash');


// Default tags
var defaults 		= {}

// Config
var global_config = {
	langs: []
};

var services = {
  facebook: 'facebookexternalhit',
  twitter: 'Twitterbot'
};

/********** PRIVATE METHODS **************/


var processConfig = function(uconfig, lang) {
	var config = _.extend({}, defaults, uconfig);

	for (var tag in config) {
		var item = config[tag];
		if (typeof item === "string") continue;

		var supported = new locale.Locales(Object.keys(item));
		var locales = new locale.Locales(lang);
		var best = locales.best(supported);
		config[tag] = item[best.code];
	}

	return config;
};

var format = function(req, config, opts) {
	var url = req.protocol + '://' + req.hostname + req.path;
	config = processConfig(config, opts.lang);

	var tags = {
		"url": url,
		"title": config.title,
		// Facebook
		"og:url": url,
		"og:description": config.description,
		"og:image": config.image,
		// Twitter
		'twitter:site': config.twitter,
		// HTML content
		'html': config.html
	};

	// Removing empty tags
	for (var tag in tags) {
		var item = tags[tag];
		if (!item) delete tags[tag];
	}

	return tags;
};


/********* CRAWL PARSER ***********/

var getService = function(userAgent) {
	if (!userAgent) return null;
	for (var name in services) {
		if (userAgent.indexOf(services[name]) != -1) {
			return name;
		}
	}
	return null;
};

var getOptions = function(req, service) {
	var options = {};

	options.requester = service || 'search-engine';
	options.lang = req.query.lang || req.headers["accept-language"];
	if (service === 'facebook') {
		if (req.query['fb_locale']) {
			options.lang = req.query['fb_locale'];
		}
	}
	return options;
};

var seoParser = function(callback) {

	return function(req, res, next) {
		var service = getService(req.headers['user-agent']);
		var ef = (typeof req.query['_escaped_fragment_'] != 'undefined') ? true : false;

		if (service === false) return next();
		if (!service && !ef) return next();

		var options = getOptions(req, service);
		callback(req, options, function(graph) {
			if (!graph) return next();

			var html = graph.html;
			delete graph.html;
			ejs.renderFile(__dirname + '/template/index.html', {cache: true, graph: graph, langs: global_config.langs, html: html}, function(err, str) {
				res.status(200).send(str);
			});
		});
	};

};

// Express middleware
var middleware = function(callback) {
	return seoParser(function(req, opts, cb) {

		callback(req, opts, function(config) {
			config = format(req, config, opts);
			return cb(config);
		});

	});
};

/********** PUBLIC METHODS **************/

module.exports = function(app) {
	var seo = {};

	// Add an SEO route
	seo.add = function(route, cb) {
		app.get(route, middleware(cb));
	};

	// Set the global config
	seo.setConfig = function(opts) {
		config = opts;
	};

	// Set seo default values
	seo.setDefaults = function(opts) {
		defaults = opts;
	};

	return seo;
};