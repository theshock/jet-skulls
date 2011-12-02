Jet.Battle = Class(
/**
 * @lends Jet.Battle#
 */
{

	/** @property {Jet.User} */
	user: null,

	/** @property {LibCanvas.Canvas2d} */
	libcanvas: null,

	/** @property {LibCanvas.Scene.Standard} */
	scene: null,

	/** @property {Jet.Battle.Player[]} */
	players: null,

	/**
	 * @constructs
	 * @param {Jet.User} user
	 * @param {LibCanvas.Canvas2D} libcanvas
	 */
	initialize: function (user, libcanvas) {
		Class.bindAll( this, 'onPlayerChange' );

		var battle = this;

		battle.user      = user;
		battle.libcanvas = libcanvas;
		battle.scene     = new LibCanvas.Scene.Standard( libcanvas.layer('units') );
		battle.players   = {};

		user.addEvent( this.rebindEvents().events );
	},

	/** @private */
	rebindEvents: function () {
		var events = {};
		for (var i in this.events) {
			events[i] = this.events[i].bind(this);
		}
		this.events = events;
		return this;
	},

	/**
	 * @param {Object} options
	 * @returns {Player}
	 */
	getPlayer: function (options) {
		return this.players[options.playerId];
	},

	onPlayerChange: function (params) {
		this.user.send( 'battle/player/statechange', params );
	},

	events: {
		'message/battle/player/new': function (params) {
			params.players.forEach(function (player) {
				player = new Jet.Battle.Player( this.scene, player );
				this.players[player.id] = player;
			}.bind(this));
		},
		'message/battle/player/statechange': function (options) {
			this.getPlayer(options).setOptions( options );
		},
		'message/battle/player/control': function (options) {
			var player = this.getPlayer(options);
			player.bindKeyboard();
			player.bindMouse();
			player.addEvent( 'change', this.onPlayerChange );
			player.setOptions({ control: true });
		}
	}
});