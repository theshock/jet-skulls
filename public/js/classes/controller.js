
Jet.Controller = Class(
/** @lends Jet.Controller# */
{
	/** @constructs */
	initialize: function () {
		this.user = this.establishConnection();

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