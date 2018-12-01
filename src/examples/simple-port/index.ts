let { ServiceBroker } 	= require("moleculer");
let GunDBService		= require("../../../index");

let broker = new ServiceBroker({
	logger: console
});

broker.createService(GunDBService);

broker.start();
