/*
 * gundb
 * Copyright (c) 2018 Fathym, Inc (https://github.com/smart-matrix/gundb)
 * MIT Licensed
 */

"use strict";

const Gun = require('gun');

module.exports = {

	name: "gundb",

	/**
	 * Default settings
	 */
	settings: {
		port: process.env.PORT || 3000,
	},

	/**
	 * Actions
	 */
	actions: {
		test(ctx) {
			return "Hello " + (ctx.params.name || "Anonymous");
		}
	},

	/**
	 * Methods
	 */
	methods: {
		initGateway() {
			var http = require('http');
			var port = this.settings.port;
			var fs = require('fs');

			// Listens on /gun.js route.
			var server = http.Server();

			// Serves up /index.html
			server.on('request', function (req, res) {
				if(Gun.serve(req, res)){ return }
				if (req.url === '/' || req.url === '/index.html') {
					fs.createReadStream('examples/index.html').pipe(res);
				}
			});

			var gun = Gun({
				file: 'data.json',
				web: server // Handles real-time requests and updates.
			});

			server.listen(port, function () {
				console.log('\nApp listening on port', port);
			});

		},
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		if (!this.gun) {
			this.initGateway();
		}
	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};