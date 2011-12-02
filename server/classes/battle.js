var Player = require( './player' ).Player;

var Battle = exports.Battle = atom.Class(
/**
 * Основной класс, который отвечает за старт боя
 * @lends Battle#
 */
{
	/**
	 * @private
	 * @property {Player[]}
	 */
	players: null,

	/**
	 * @private
	 * @property {Map}
	 */
	map: null,

	/**
	 * Next player id in the game
	 * @private
	 * @property {number}
	 */
	playerId: 0,

	/**
	 * @constructs
	 * @param {Invoker} invoker
	 * @param {Map} map
	 */
	initialize: function (invoker, map) {
		this.players = [];
		this.map     = map;

		invoker.subscribe( this.update.bind(this) );
	},

	/**
	 * Calls each tick
	 * @private
	 */
	update: function (time) {
		this.players.invoke( 'update', time );
	},

	/**
	 * Добавляет нового пользователя в игру
	 * @param {User} user
	 * @returns {Battle}
	 */
	addUser: function (user) {
		var player = new Player( this, this.playerId++ );

		player.owner = user;

		// Оповещаем всех игроков о появлении новенького
		this.announcement( 'battle/player/new', { players: this.getPlayersList([ player ]) });

		this.players.push( player );

		// Передаём новенькому игроку карту
		user.send( 'battle/map', { map: this.map.toString() });
		// Список игроков
		user.send( 'battle/player/new', { players: this.getPlayersList() });
		// Сообщаем пользователю, какого игрока он контролирует
		user.send( 'battle/player/control', { playerId: player.id });

		// если пользователю хочет изменить параметры игрока
		user.addEvent( 'message/battle/player/statechange', function (params) {
			player.setOptions( params );
		});

		// Если соединение разорвалось. Мы не посылаем "выход", потому что
		// соединение ещё может восстановиться
		user.addEvent( 'disconnect', function () {
			player.setOptions({ disconnected: true });
		});

		return this;
	},

	/**
	 * Возвращаем список игроков в json-формате
	 * @private
	 * @param {Player[]} [players=null]
	 * @returns Array
	 */
	getPlayersList: function (players) {
		return (players || this.players).property('options')
	},

	/**
	 * Посылает сообщение всем пользователям
	 * @param {string} command
	 * @param {Object/Function} params
	 * @returns {Battle}
	 */
	announcement: function (command, params) {
		this.players.forEach(function (player, index) {
			if (typeof params == 'function') {
				params = params.call( this, player, index );
			}
			player.owner.send( command, params );
		});
		return this;
	}


});