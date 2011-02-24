
var http   = require('http'),
    url    = require('url');

exports.server = function (port) {
	var server = http.createServer(function(req, res){
		var path = url.parse(req.url).pathname;

		switch (path){
			case '/':
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write('Jet Skulls!');
				res.end();
				break;

			default:
				res.writeHead(404);
				res.write('404');
				res.end();
				break;
		}
	});
	server.listen(port);
	return server;
};