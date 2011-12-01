
var User = exports.User = atom.Class(
/**
 * Класс, который отвечает за пользователя
 * @lends User#
 */
{
	Implements: atom.Class.Events,

	/**
	 * @constructs
	 * @param {Client} connection
	 */
	initialize: function (connection) {
		this.listen(connection);
	},

	/**
	 * @private
	 * @param {Client} connection
	 */
	listen: function (connection) {
		var user = this;
		user.connection = connection;
		connection.on( 'message', function(message){
			console.log( 'msg' );
			user.fireEvent( 'message/' + message.command, [ message.params ]);
			user.fireEvent( 'message'  , [ message.command, message.params ]);
		});
	},

	/**
	 * @param {string} command
	 * @param {object} params
	 * @returns {User}
	 */
	send: function (command, params) {
		this.fireEvent( 'command', [ command, params ]);

		this.connection.send({
			command: command,
			params : params
		});

		return this;
	},

	/** @returns {User} */
	sendHello: function () {
		return this.send( 'system/hello', { sessionId: this.sessionId });
	},

	/** @returns {User} */
	bindEcho: function () {
		return this.addEvent( 'message', function (command, params) {
			this.send( 'system/echo', { command: command, params: params });
		});
	}
});