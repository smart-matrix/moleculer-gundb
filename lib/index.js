"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const gun_1 = __importDefault(require("gun"));
const GunDBService = {
    name: "gundb",
    mixins: [],
    settings: {
        port: process.env.PORT || 3000,
    },
    actions: {
        test(ctx) {
            return "Hello there " + (ctx.params.name || "Anonymous");
        }
    },
    methods: {
        initGateway() {
            var http = require('http');
            var port = this.settings.port;
            var fs = require('fs');
            // Listens on /gun.js route.
            var server = http.Server();
            // Serves up /index.html
            server.on('request', function (req, res) {
                if (gun_1.default.serve(req, res)) {
                    return;
                }
                if (req.url === '/' || req.url === '/index.html') {
                    fs.createReadStream('examples/index.html').pipe(res);
                }
            });
            var gun = gun_1.default({
                file: 'data.json',
                web: server // Handles real-time requests and updates.
            });
            server.listen(port, function () {
                console.log('\nApp listening on port', port);
            });
        },
    },
    created() {
        if (!this.gun) {
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