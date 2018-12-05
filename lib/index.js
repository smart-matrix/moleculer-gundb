"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const gun_1 = __importDefault(require("gun"));
const http_1 = require("http");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ws_1 = __importDefault(require("ws"));
const GunDBService = {
    name: "gundb",
    mixins: [],
    settings: {
        exampleFile: null,
        gunJsFilePath: null,
        port: process.env.PORT || 3000,
        server: undefined,
        useSocketGateway: true
    },
    actions: {},
    methods: {
        acceptConnection(connection) {
            this.logger.info('Accepting connection...');
            this.gunPeers.push(connection);
            connection.on('error', this.onSocketError);
            connection.on('message', this.onSocketMessage);
            connection.on('close', (reason, desc) => {
                this.onSocketClosed(connection, reason, desc);
            });
        },
        buildSimpleServer(port) {
            var server = new http_1.Server();
            server.on('request', (req, res) => {
                if (this.serveGun()(req, res))
                    return;
                if (this.settings.exampleFile)
                    if (req.url === '/' || req.url === '/index.html')
                        fs_1.default.createReadStream(this.settings.exampleFile).pipe(res);
            });
            return server;
        },
        establishGun() {
            if (this.settings.useSocketGateway) {
                this.logger.info('Establishing gun socket out message handler');
                // Gun.on('out', this.onGunOutMessage);
            }
            this.gun = new gun_1.default({
                file: 'c:\\temp2\\data.json'
            });
            this.logger.info('Gun instance has been established.');
        },
        handleSocketServer(req, res) {
            var insert = "";
            if (req.url.endsWith(".js"))
                insert = this.settings.gunJsFilePath;
            var filePath = path_1.default.join(__dirname, insert, req.url);
            fs_1.default.createReadStream(filePath).on('error', () => {
                if (this.settings.exampleFile) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(fs_1.default.readFileSync(path_1.default.join(__dirname, this.settings.exampleFile))); // or default to index
                }
            }).pipe(res); // stream
        },
        initGateway() {
            if (this.settings.server) {
                this.logger.info('Using configured server from settings.');
                this.server = this.settings.server;
            }
            else if (this.server) {
                this.logger.info('Using server from local fields.');
                this.server = this.server;
            }
            else {
                var port = this.settings.port;
                this.logger.info(`Building dev server with port: ${port}`);
                this.server = this.buildSimpleServer(port);
            }
            this.gun = new gun_1.default({
                file: 'data.json',
                web: this.server
            });
        },
        initSocketGateway() {
            this.server = http_1.createServer(this.handleSocketServer);
            var WebSocketServer = ws_1.default.Server;
            var wss = new WebSocketServer({
                server: this.server,
                autoAcceptConnections: false // want to handle the request (websocket npm?)
            });
            wss.on('connection', this.acceptConnection);
        },
        onGunOutMessage(msg) {
            this.logger.info(`Processing out message: ${msg}`);
            // this.gun.to.next(msg);
            msg = JSON.stringify(msg);
            this.gunPeers.forEach((peer) => {
                peer.send(msg);
            });
        },
        onSocketClosed(connection, reason, desc) {
            this.logger.info('Closing Connection');
            // gunpeers gone.
            var i = this.gunPeers.findIndex((p) => {
                return p === connection;
            });
            if (i >= 0)
                this.gunPeers.splice(i, 1);
        },
        onSocketError(error) {
            this.logger.error(`WebSocket Error: ${error}`);
        },
        onSocketMessage(msg) {
            msg = JSON.parse(msg);
            this.logger.info(`Message Recieved: ${msg}`);
            if ("forEach" in msg) {
                msg.forEach(m => this.gun.on('in', JSON.parse(m)));
            }
            else {
                this.gun.on('in', msg);
            }
            //	TODO:	This is a definite hack to call Gun out messages because the Gun.on('out', ...) isn't working.
            this.onGunOutMessage(msg);
        },
        serveGun() {
            return gun_1.default.serve;
        },
        startServer(server) {
            this.logger.info('Starting Server');
            if (this.settings.useSocketGateway) {
                // do not do this to attach server... instead pull websocket provider and use that.
                // this.gun.wsp(this.server);
            }
            server.listen(this.settings.port, () => {
                this.logger.info(`App listening on port ${this.settings.port}`);
            });
            this.serverStarted = true;
        }
    },
    created() {
        if (!this.gun) {
            this.establishGun();
            if (this.settings.useSocketGateway) {
                this.logger.info(`Initializing the gun socket gateway.`);
                this.gunPeers = [];
                this.initSocketGateway();
            }
            else {
                this.logger.info(`Initializing the gun gateway.`);
                this.initGateway();
            }
        }
    },
    started() {
        if (!this.serverStarted && this.server)
            this.startServer(this.server);
    },
    stopped() {
    }
};
module.exports = GunDBService;
//# sourceMappingURL=index.js.map