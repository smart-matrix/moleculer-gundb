"use strict";

let { ServiceBroker } 	= require("moleculer");
let ApiGateway = require("moleculer-web");
let GunDBService		= require("../../index");
let Gun 				= require('gun/gun');

// Create broker
let broker = new ServiceBroker({
	logger: console
});

// Load my service
broker.createService({
	name: 'gun.test',
	mixins: [ApiGateway, GunDBService],
	settings: {
		port: 3001
	}
});

// Start server
broker.start().then(() => {
	var gun = new Gun('http://localhost:3001/');

	gun.get('hello').once(function(data, key) {
		console.log(data.name);
	});

	gun.get('hello').put({ name: 'World_New' });

	setTimeout(() => {
		gun.get('hello').put({ name: 'World_New2' });
	}, 1000);

	gun.get('hello').on(function(data, key) {
		console.log(data.name);
	});
});
