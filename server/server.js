var port = 6660,
    perSecond = 1,

    // Importing modules
    http = require('http'), 
    url = require('url'),
    io = require('./lib/socket.io'),
    sys = require('sys'),
    atom = require('./atom'),
    libcanvas = require('./libcanvas'),

units = { },

Unit = atom.Class({
    position : null,
    frags : 0,
    previousUpdateTime : 0,

    initialize : function () {
        this.previousUpdateTime = Date.now();
        this.position = new LibCanvas.Point(0, 0);
    },
    move : function (client, data) {
        this.position.move((Date.now() - this.previousUpdateTime) * perSecond * (data.direction.limit(-1, 1)));
        this.previousUpdateTime = Date.now();
    }
}),

server = http.createServer(function(req, res){
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

var io = io.listen(server), buffer = [];

io.on('connection', function (client) {
    client.send({ buffer: buffer });
    client.broadcast({ announcement: client.sessionId + ' connected' });

    var unit = new Unit();
    units[client.sessionId] = unit;

    client.on('message', function (message) {
        switch (message.cmd) {
            case 'move':
                units[client.sessionId].move(client, message);
                break;
        }
    });

    client.on('disconnect', function(){
        delete units[client.sessionId];
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
});
