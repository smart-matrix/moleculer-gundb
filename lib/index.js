"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const gun_1 = __importDefault(require("gun"));
const http_1 = require("http");
const fs_1 = __importDefault(require("fs"));
const GunDBService = {
    name: "gundb",
    mixins: [],
    settings: {
        port: process.env.PORT || 3000,
        server: undefined
    },
    actions: {},
    methods: {
        serveGun() {
            return gun_1.default.serve;
        },
        buildSimpleServer(port) {
            var server = new http_1.Server();
            server.on('request', (req, res) => {
                if (this.serveGun()(req, res))
                    return;
                if (req.url === '/' || req.url === '/index.html')
                    fs_1.default.createReadStream('lib/examples/index.html').pipe(res);
            });
            server.listen(port, function () {
                console.log('\nApp listening on port', port);
            });
            return server;
        },
        initGateway() {
            var port = this.settings.port;
            if (this.settings.server) {
                this.logger.info('Using configured server from settings.');
                this.server = this.settings.server;
            }
            else if (this.server) {
                this.logger.info('Using server from local fields.');
                this.server = this.server;
            }
            else {
                this.logger.info(`Building dev server with port: ${port}`);
                this.server = this.buildSimpleServer(port);
            }
            this.gun = gun_1.default({
                file: 'data.json',
                web: this.server
            });
        },
    },
    created() {
        if (!this.gun) {
            this.logger.info(`Initializing the gun gateway.`);
            this.initGateway();
        }
    },
    started() {
    },
    stopped() {
    }
};
module.exports = GunDBService;
//# sourceMappingURL=index.js.map