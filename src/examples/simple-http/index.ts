"use strict";

let { ServiceBroker } = require("moleculer");
import { Server } from 'http';
import Gun from 'gun';
import fs from 'fs';
let GunDBService = require("../../../index");

let broker = new ServiceBroker({
	logger: console
});

var config = { port: 3000 };

var serverSetup = new Server();

serverSetup.on('request', function (req, res) {
	if (gunSvc.serveGun()(req, res))
		return;

	if (req.url === '/' || req.url === '/index.html') {
		fs.createReadStream('lib/examples/index.html').pipe(res);
	}
});

var server = serverSetup.listen(config.port, function () {
	console.log('\nApp listening on port', config.port);
});

const gunSvc = broker.createService({
	name: 'gundb.test.http',

	mixins: [GunDBService],

	settings: {
		exampleFile: 'lib/examples/index.html',
		port: config.port,
		server: server,
		useSocketGateway: false
	}
});

broker.start().then(() => {
});
