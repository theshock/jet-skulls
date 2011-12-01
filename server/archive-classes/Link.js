
GLOBAL.Link = atom.Class({
	Implements: [atom.Class.Events],
	
	initialize: function (field, client) {
		this.field  = field;
		this.client = client;
		this.id     = client.sessionId;
		
		client.on('message', this._onMessage.context(this));
		client.on('disconnect', this._onDisconnect.context(this));
		this.readyEvent('connect');
	},
	
	send: function (data) {
		this.client.send(data);
		return this;
	},
	
	broadcast: function (data) {
		this.client.broadcast(data);
		return this;
	},
	
	announcement: function (msg) {
		console.log(this.id + ': ' + msg);
		this.client.broadcast({ announcement: this.id + ': ' + msg });
		return this;
	},
	
	_onMessage: function () {
		this.fireEvent('message', arguments);
	},
	_onDisconnect: function () {
		this.fireEvent('disconnect', arguments);
	}
});