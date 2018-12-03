let { ServiceBroker } = require("moleculer");
let GunDBService = require("../../../index");
let broker = new ServiceBroker({
    logger: console
});
broker.createService({
    name: 'gundb.port.test',
    mixins: [GunDBService],
    settings: {
        exampleFile: 'lib/examples/index.html',
        useSocketGateway: false
    }
});
broker.start();
//# sourceMappingURL=index.js.map