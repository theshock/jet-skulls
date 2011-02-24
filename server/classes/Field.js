

GLOBAL.Field = atom.Class({
	_units: {},

	initialize: function (width, height) {
		this.width  = width;
		this.height = height;
	},

	get units () {
		var array = [];
		for (var i in this._units) {
			array.push(this._units[i].object);
		}
		return array;
	},

	createUnit: function (id) {
		var unit = new Unit(id, this);
		this._units[id] = unit;
		return this;
	},

	getUnit: function (id) {
		return this._units[id];
	},

	deleteUnit: function (unit) {
		delete this._units[unit.id];
		return this;
	},

	randomPoint: function () {
		return new Point(
			Number.random(0, this.width),
			Number.random(0, this.height)
		);
	}
});