var Link = atom.Class({
	Implements: [atom.Class.Events],

	socket: null,
	initialize: function (port) {
		this.socket = new io.Socket(location.host, { port : port });
		this.socket.on('connect', this._onConnect.context(this));
		this.socket.on('message', this._onMessage.context(this));
	},

	connect: function () {
		this.socket.connect();
		return this;
	},

	send: function (data) {
		this.socket.send(JSON.stringify(data));
		return this;
	},

	_onConnect: function () {
		this.fireEvent('connect', arguments);
	},
	_onMessage: function () {
		this.fireEvent('message', arguments);
	},
});