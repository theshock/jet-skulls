

GLOBAL.Link = atom.Class({
	initialize: function () {
		// JSON.stringify(
	}
});

var io = require('socket.io');

GLOBAL.Link = atom.Class({
	Implements: [atom.Class.Events],

	socket: null,
	initialize: function (server) {
		this.server = server;
	},

	connect: function () {
		this.socket = io.listen(this.server);

		this.socket.on('connection', this._onConnect.context(this));
		this.socket.on('message',    this._onMessage.context(this));
		this.socket.on('disconnect', this._onDisconnect.context(this));
		
		return this;
	},

	send: function (data) {
		this.socket.send(JSON.stringify(data));
		return this;
	},

	_onConnect: function (client) {
		this.client = client;
		this.id = client.sessionId;
		this.client.broadcast({ announcement: this.client.sessionId + ' connected' });
		this.fireEvent('connect', arguments);
	},
	_onMessage: function () {
		this.fireEvent('message', arguments);
	},
	_onDisconnect: function () {
		this.client.broadcast({ announcement: this.client.sessionId + ' disconnected' });
		this.fireEvent('disconnect', arguments);
	}
});