
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