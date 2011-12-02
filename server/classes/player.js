
var Utils = require( 'jet-utils' );
var invertedSqrt2 = 1 / Math.SQRT2;

var Player = exports.Player = atom.Class(
/**
 * @lends Player#
 * @augments Class.Options#
 */
{
	Extends: atom.Class.Options,

	options: {
		positionX: 0,
		positionY: 0,
		moveX: 0,
		moveY: 0,
		angle: 0,
		speed: 2 // 2 cells per second
	},

	/**
	 * Флаг, который обозначает, что игрок инициализирован и изменения должны рассылаться всем игрокам.
	 * @private
	 * @property {boolean}
	 */
	ready: false,

	/** @property {User} */
	owner: null,

	/** @property {Battle} */
	battle: null,

	/**
	 * Player ID in battle
	 * @property {number} id
	 */
	get id () {
		return this.options.playerId;
	},

	set id (id) {
		return this.setOptions({ playerId: id });
	},

	/**
	 * @constructs
	 * @param {Battle} battle
	 * @param {number} id
	 */
	initialize: function (battle, id) {
		this.battle = battle;

		this.id = id;
		this.moveToCell( battle.map.rectangle.getRandomPoint() );
		this.ready = true;
	},

	/**
	 * @param {LibCanvas.Point} point
	 * @returns {Player}
	 */
	moveToCell: function (point) {
		return this.setOptions({
			positionX: point.x * 1000 + 500,
			positionY: point.y * 1000 + 500
		});
	},

	/**
	 * @param {Object} options
	 * @returns {Player}
	 */
	setOptions: function (options) {
		var diff = Utils.objectDiff( this.options, options );
		this.parent( options );
		if (this.ready && Object.keys(diff).length) {
			// оповещаем всех игроков, о том, что изменилось состояние текущего игрока
			diff.playerId = this.id;
			this.battle.announcement( 'battle/player/statechange', diff );
		}
		return this;
	},

	update: function (time) {
		var o = this.options;
		var values = {};

		if (o.moveX || o.moveY) {
			var speed = time * o.speed;
			// при ходьбе по-диагонали скорость не должна быть больше
			if (o.moveX && o.moveY) speed *= invertedSqrt2;

			values.positionX = (o.positionX + speed * o.moveX).round();
			values.positionY = (o.positionY + speed * o.moveY).round();
		}

		this.setOptions(values);
	}
});