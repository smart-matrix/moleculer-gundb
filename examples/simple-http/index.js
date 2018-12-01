"use strict";

let { ServiceBroker } = require("moleculer");
let http = require('http');
let Gun = require('gun');
let fs = require('fs');
let GunDBService = require("../../index");

let broker = new ServiceBroker({
	logger: console
});

var config = { port: 3000 };

var server = http.Server();

const gunSvc = broker.createService({
	name: 'gundb.test.http',

	mixins: [GunDBService],

	settings: {
		server: server
	}
});

broker.start().then(() => {
});

server.on('request', function (req, res) {
	if (gunSvc.serveGun()(req, res))
		return;

	if (req.url === '/' || req.url === '/index.html') {
		fs.createReadStream('examples/index.html').pipe(res);
	}
});

server.listen(config.port, function () {
	console.log('\nApp listening on port', config.port);
});
