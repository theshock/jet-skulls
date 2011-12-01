
var User = require( './user' ).User;

var Game = exports.Game = atom.Class(
/**
 * Основной класс, который отвечает за старт боя
 * @lends Game#
 */
{
	/**
	 * @private
	 * @property {User[]}
	 */
	users: null,

	/**
	 * @constructs
	 */
	initialize: function () {
		this.users = [];
	},

	/**
	 * Вызывается каждый раз, когда подключается новый пользователь
	 * @param {Client} client
	 * @returns {Game}
	 */
	addClient: function (client) {
		this.users.push(
			new User(client)
				.sendHello()
				.bindEcho()
		);
		return this;
	},

	/**
	 * Посылает сообщение всем пользователям
	 * @param {string} command
	 * @param {object|function} params
	 * @returns {Game}
	 */
	announcement: function (command, params) {
		this.users.forEach(function (user, index) {
			if (typeof params == 'function') {
				params = params.call( this, user, index );
			}
			user.send( command, params );
		});
		return this;
	}


});