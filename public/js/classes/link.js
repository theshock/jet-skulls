var Link = atom.Class({
	Implements: [
		atom.Class.Events,
		atom.Class.Options
	],

	options: {
		host: location.host,
		port: 8124
	},

	socket: null,
	initialize: function (options) {
		this.setOptions(options);
		this.socket = new io.Socket(this.options.host, { port : this.options.port });
		this.socket.on('connect', this._onConnect.context(this));
		this.socket.on('message', this._onMessage.context(this));
	},

	connect: function () {
		this.socket.connect();
		return this;
	},

	send: function (data) {
		this.socket.send(data);
		return this;
	},

	_onConnect: function () {
		this.fireEvent('connect', arguments);
	},
	_onMessage: function () {
		this.fireEvent('message', arguments);
	},
});