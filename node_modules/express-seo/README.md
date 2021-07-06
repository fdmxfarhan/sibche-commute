# Express-seo

Express plugin to easily improve the SEO/social media crawling of your web apps.

## What is it ?

More and more websites process templates on the client side with the use of frameworks like Angular.js and as you must know, search engines and social media bots (Facebook, twitter...) don't execute javascript when crawling your pages, so basically without some work on the server side, your SEO sucks.
This plugin aims to provide all the necessary tools for your SEO & social media sharing with a Node.js app using Express.
Moreover this give you more flexibility and its easier to put in place than libraries using PhantomJS to generate static pages.

## How to install
```js
npm install express-seo --save
```

## How to use

```js
var seo = require('express-seo')(app);

// For internatanalization, set the supported languages
seo.setConfig({
	langs: ["en", "fr"]
});

// Set the default tags
seo.setDefaults({
	html: "<a href='https://twitter.com/MaximeMezrahi'>Follow me on twitter</a>" // Special property to insert html in the body (interesting to insert links)
	title: "Awesome website", // Page title
	// All the other properties will be inserted as a meta property
	description: {
		en: "Check out my awesome website",
		fr: "Decouvez mon incroyable site"
	},
	image: "https://assets-cdn.github.com/images/modules/dashboard/bootcamp/octocat_setup.png"
});

// Create an seo route
seo.add("/contact", function(req, opts, next) {
	/*
	req: Express request
	opts: Object {
		service: String ("facebook" || "twitter" || "search-engine")
		lang: String (Detected language)
	}
	*/
	next({
		description: "Amazing contact page"
	});
});
```

If you use HTML5 URL scheme then you should let the crawler know you're serving an AJAX application by adding the following to the HEAD tag of your page:
```html
<meta name=”fragment” content=”!”>
```

## License

(The MIT License)

Copyright (c) 2015 Maxime Mezrahi

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

```