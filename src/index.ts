import { ServiceSchema } from "moleculer";
import Gun from 'gun';

const GunDBService: ServiceSchema = {
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
				if(Gun.serve(req, res)){ return }
				if (req.url === '/' || req.url === '/index.html') {
					fs.createReadStream('examples/index.html').pipe(res);
				}
			});

			var gun = Gun({
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

export = GunDBService;
