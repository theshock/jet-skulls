
Jet.Controller = Class(
/** @lends Jet.Controller# */
{

	Static: {
		/** @static */
		MAP_TILE_SIZE: 32
	},

	/** @property {Jet.Battle} */
	battle: null,

	/** @constructs */
	initialize: function () {
		var tile = Jet.Controller.MAP_TILE_SIZE;

		this.libcanvas = new LibCanvas( 'canvas', {
				clear: false,
				preloadImages: {
					'player-own'     : '/images/players.png [20:20]{0:0}',
					'player-enemy'   : '/images/players.png [20:20]{1:0}',
					'player-inactive': '/images/players.png [20:20]{2:0}'
				}
			})
			.size( tile * 16, tile * 16, true )
			.listenMouse()
			.start()
			.addEvent('ready', function () {
				this.user = this.establishConnection();
				this.libcanvas.createLayer('units');
				this.battle = new Jet.Battle( this.user, this.libcanvas );
			}.bind(this));

		// todo: remove after debug;
		window.jet = this;
	},

	/**
	 * @private
	 * @returns {Jet.User}
	 */
	establishConnection: function () {
		var socket = new io.Socket(location.host, { port : 6660 });
		var user = new Jet.User( socket );
		socket.connect();
		return user;
	}
});