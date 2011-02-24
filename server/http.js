
var http   = require('http');

exports.server = function (port) {
	var server = http.createServer(function(req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('Jet Skulls!');
		res.end();
	});
	server.listen(port);
	return server;
};