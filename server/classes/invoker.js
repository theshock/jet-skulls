
var Invoker = exports.Invoker = atom.Class(
/**
 * Класс, который опиисывает карту
 * @lends Invoker#
 * @augments Class.Events#
 */
{
	Implements: atom.Class.Events,

	/**
	 * @constructs
	 */
	initialize: function () {
		this.time = Date.now();
		this.next();
	},

	/**
	 * @param {function} fn
	 * @returns {Invoker}
	 */
	subscribe: function (fn) {
		return this.addEvent( 'frame', fn );
	},

	/** @private */
	next: function () {
		//process.nextTick(function () {
		(function () {
			var now = Date.now();
			var delta = now - this.time;
			this.time = now;

			this.fireEvent( 'frame', [ delta ]);

			this.next();
		}.delay(20, this));
		//}.bind(this));
	}
});