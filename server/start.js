require.paths.unshift(__dirname + '/lib');

global.atom = require('atom-server').atom;
require('libcanvas-server').LibCanvas.extract(global);

var Battle  = require('./classes/battle' ).Battle;
var Map     = require('./classes/map'    ).Map;
var Invoker = require('./classes/invoker').Invoker;
var User    = require('./classes/user'   ).User;

var battle = new Battle( new Invoker(), new Map(require('./levels').test) );

require('socket.io').listen(
	require('./http').server(6660)
).on('connection', function (client) {
	var user = new User(client);
	user.sendHello();
	battle.addUser(user);
});