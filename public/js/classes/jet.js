var Jet = atom.Class({
	initialize: function (options) {
		this.libcanvas = new LibCanvas(options.element).start();
		this.link      = new Link(options.server);

		this.link.connect().addEvent('connect', this.start.context(this));
		this.link.connect().addEvent('message', this.message.context(this));
	},

	start: function (data) {
		this.createUnit(data.player);
	},

	units: {},
	createUnit: function (unit) {
		unit = new Unit(unit);
		this.libcanvas.addElement(unit);
		this.units[unit.id] = unit;
	},

	message: function (data) {
		if (data.units) for (var i = data.units.length; i--;) {
			var unit = data.units[i];
			if (this.units[unit.id]) {
				this.units[unit.id].update(unit);
			} else {
				this.createUnit(unit);
			}
		}
	}
});