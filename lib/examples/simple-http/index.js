"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let { ServiceBroker } = require("moleculer");
const http_1 = require("http");
const fs_1 = __importDefault(require("fs"));
let GunDBService = require("../../../index");
let broker = new ServiceBroker({
    logger: console
});
var config = { port: 3000 };
var serverSetup = new http_1.Server();
serverSetup.on('request', function (req, res) {
    if (gunSvc.serveGun()(req, res))
        return;
    if (req.url === '/' || req.url === '/index.html') {
        fs_1.default.createReadStream('lib/examples/index.html').pipe(res);
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
//# sourceMappingURL=index.js.map