require.paths.unshift(__dirname + '/lib');

global.atom = require('atom-server').atom;
require('libcanvas-server').LibCanvas.extract(global);

var Game = require('./classes/game').Game;

var game = new Game();

require('socket.io').listen(
	require('./http').server(6660)
).on('connection', function (client) {
	game.addClient(client);
});