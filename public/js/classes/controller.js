
Jet.Controller = Class(
/** @lends Jet.Controller# */
{

	/** @property {Jet.Battle} */
	battle: null,

	/** @constructs */
	initialize: function () {
		this.user = this.establishConnection();
		this.libcanvas = new LibCanvas( 'canvas', { clear: false })
			.size( 256, 256, true )
			.start();

		this.libcanvas.createLayer('units');

		this.battle = new Jet.Battle( this.user, this.libcanvas );

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