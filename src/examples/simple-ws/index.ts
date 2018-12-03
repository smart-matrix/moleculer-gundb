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

const gunSvc = broker.createService({
	name: 'gundb.test.ws',

	mixins: [GunDBService],

	settings: {
		exampleFile: 'examples/index.html',
		gunJsFilePath: '../node_modules/gun',
		port: config.port
	}
});

broker.start().then(() => {
});
