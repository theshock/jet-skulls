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
		for (var i = this.events.length; i--;) {
			events = this.events[i].bind(this);
		}
		this.events = events;
		return this;
	},

	events: {
		'message/battle/player/new': function (params) {
			var scene = this.scene, players = this.players;
			params.players.forEach(function (player) {
				players[player.playerId] = new Jet.Unit( scene, player );
			});
		},
		'message/battle/player/statechange': function (player) {
			this.players[player.playerId].setOptions( player );
		},
		'message/battle/player/control': function (player) {
			this.players[player.playerId].setOptions({ control: true });
		}
	}
});