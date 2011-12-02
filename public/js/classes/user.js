
Jet.User = Class(
/**
 * @lends Jet.User#
 * @augments Class.Events#
 */
{
	Implements: Class.Events,

	/**
	 * @private
	 * @property {io.Socket}
	 */
	connection: null,

	/**
	 * @constructs
	 * @param {io.Socket} connection
	 */
	initialize: function (connection) {
		this.listen(connection);
		this.addDebugEvents();
	},

	/**
	 * @private
	 * @param {io.Socket} connection
	 */
	listen: function (connection) {
		var user = this;
		user.connection = connection;
		connection.on( 'message', function(message){
			user.fireEvent( 'message/' + message.command, [ message.params ]);
			user.fireEvent( 'message'  , [ message.command, message.params ]);
		});

		var start = {
			w: { 'moveY': -1 },
			s: { 'moveY': +1 },
			a: { 'moveX': -1 },
			d: { 'moveX': +1 }
		};

		var finish = {
			w: { 'moveY': 0 },
			s: { 'moveY': 0 },
			a: { 'moveX': 0 },
			d: { 'moveX': 0 }
		};

		new LibCanvas.Keyboard().addEvent({
			'down': function (e) {
				if (this.keyState(e.keyName)) return;
				user.change(start[e.keyName]);
			},
			'up': function (e) {
				user.change(finish[e.keyName]);
			}
		});
	},

	/** @private */
	addDebugEvents: function () {
		var debug = function (type, command, params) {
			var descr = '  - [' + type + ': "' + command + '"] ';
			console.log( Jet.Utils.padRight(descr, ' ', 32), atom.clone(params), Jet.Utils.dateDebug() );
		};

		this.addEvent( 'message', debug.bind( this, 'message' ) );
		this.addEvent( 'command', debug.bind( this, 'command' ) );
	},

	change: function (params) {
		this.send( 'battle/player/statechange', params );
		return this;
	},

	/**
	 * @param {string} command
	 * @param {object} params
	 */
	send: function (command, params) {
		this.fireEvent( 'command', [ command, params ]);

		this.connection.send({
			command: command,
			params : params
		});
	}

});