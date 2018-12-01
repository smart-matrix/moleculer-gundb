import { ServiceSchema } from "moleculer";
import Gun from 'gun';
import { Server } from 'http';
import fs from 'fs';

const GunDBService: ServiceSchema = {
	name: "gundb",

	mixins: [],

	settings: {
		port: process.env.PORT || 3000,
		server: undefined
	},

	actions: {
	},

	methods: {
		serveGun() {
			return Gun.serve;
		},

		buildSimpleServer(port) {
			var server = new Server();

			server.on('request', (req, res) => {
				if (this.serveGun()(req, res))
					return;

				if (req.url === '/' || req.url === '/index.html')
					fs.createReadStream('lib/examples/index.html').pipe(res);
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
			} else if (this.server) {
				this.logger.info('Using server from local fields.');

				this.server = this.server;
			} else {
				this.logger.info(`Building dev server with port: ${port}`);

				this.server = this.buildSimpleServer(port);
			}

			this.gun = Gun({
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

export = GunDBService;
