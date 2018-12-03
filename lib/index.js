;(function(){
	var fs = require('fs');
	var config = { port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 3000 };
	var Gun = require('gun');

	if(process.env.HTTPS_KEY){
		config.key = fs.readFileSync(process.env.HTTPS_KEY);
		config.cert = fs.readFileSync(process.env.HTTPS_CERT);
		config.server = require('https').createServer(config, Gun.serve);
	} else {
		config.server = require('http').Server();
    }
    
	config.server.on('request', (req, res) => {
		if (Gun.serve(req, res))
			return;

        if (req.url === '/' || req.url === '/index.html')
			fs.createReadStream('lib/examples/index.html').pipe(res);
	});

    var gun = Gun({web: config.server.listen(config.port) });
    
	console.log('Relay peer started on port ' + config.port + ' with /gun');
}());