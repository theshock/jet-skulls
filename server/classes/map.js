
var Map = exports.Map = atom.Class(
/**
 * Класс, который опиисывает карту
 * @lends Map#
 */
{
	version: 1,

	/**
	 * @private
	 * @property {number[][]}
	 */
	cells: null,

	/** @property {number} */
	width: 0,

	/** @property {number} */
	height: 0,

	/** @property {LibCanvas.Shapes.Rectangle} */
	rectangle: null,

	/**
	 * @constructs
	 * @params {number[][]} cells
	 */
	initialize: function (cells) {
		this.cells  = cells;
		this.width  = cells.length;
		this.height = cells[0].length;
		this.rectangle = new Rectangle(0, 0, this.width, this.height);
	},

	toString: function () {
		return this.version + ';' + this.cells.map(function (row) {
			return row.join('.')
		}).join(';');
	}
});