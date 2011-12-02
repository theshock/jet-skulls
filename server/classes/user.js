
var User = exports.User = atom.Class(
/**
 * Класс, который отвечает за пользователя
 * @lends User#
 * @augments Class.Events#
 */
{
	Implements: atom.Class.Events,

	/** @property {number} */
	sessionId: null,

	/** @property {Client} */
	connection: null,

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

		// нам необходим connection, чтобы слать сообщение пользователю
		user.connection = connection;

		// при получении сообщения от пользователя
		connection.on( 'message', function(message){
			// срабатывает событие команды
			user.fireEvent( 'message/' + message.command, [ message.params ]);
			// и срабатывает событие о сообщении в целом
			user.fireEvent( 'message'  , [ message.command, message.params ]);
		});

		connection.on( 'disconnect', function (message) {
			user.fireEvent( 'disconnect' );
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

	/**
	 * Посылает приветственное сообщение с айди игрока
	 * @returns {User}
	 */
	sendHello: function () {
		return this.send( 'system/hello', { sessionId: this.sessionId });
	}
});