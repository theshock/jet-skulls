require.paths.unshift(__dirname + '/lib');

require('atom');
require('libcanvas');

require('./classes/Unit');
require('./classes/Field');

LibCanvas.extract();

new function () {
	var io    = require('socket.io').listen(require('./http').server(6660));
	var field = new Field(800, 500);

	io.on('connection', function (client) {
		client.broadcast({ announcement: client.sessionId + ' connected' });

		var unit = field.createUnit(client.sessionId);

		var p = unit.position;
		console.log(client.sessionId + ' connected: [' + p.x + ':' + p.y + ']');

		client.send({
			screen: field.object,
			player: unit.object,
			units : field.units,
		});
		client.broadcast({ unit  : unit.object });

		client.on('message', function (message) {
			if (message.unit) {
				unit.update(message.unit);
				client.broadcast({ unit: unit.object });
				client.send     ({ unit: unit.object });
			}
		});

		client.on('disconnect', function(){
			field.deleteUnit(unit);

			client.broadcast({
				disconnected: unit.id,
				announcement: client.sessionId + ' disconnected'
			});
			console.log(client.sessionId + ' disconnected');

			unit = null;
		});
	});
};