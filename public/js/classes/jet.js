var Jet = atom.Class({
	initialize: function (options) {
		this.libcanvas = new LibCanvas(options.element).start();
		this.link      = new Link(options.server).connect();

		this.link.addEvent('connect', this.start.context(this));
		this.link.addEvent('message', this.message.context(this));
	},

	start: function () {},

	units: {},
	createUnit: function (unit) {
		unit = new Unit(unit);
		this.libcanvas.addElement(unit).update();
		this.units[unit.id] = unit;
		return unit;
	},
	updateUnit: function (unit) {
		if (this.units[unit.id]) {
			this.units[unit.id].update(unit);
		} else {
			this.createUnit(unit);
		}
		return this;
	},

	message: function (data) {
		for (var i in data) {
			if (i in this.actions) {
				this.actions[i].call(this, data[i])
			} else {
				atom.log('No action «' + i + '»');
			}
		}
	},
	actions: {
		screen: function (screen) {
			this.libcanvas.set(screen);
		},
		player: function (player) {
			this.createUnit(player);
		},
		units: function (units) {
			for (var i = units.length; i--;) {
				this.updateUnit(units[i]);
			}
		},
		unit: function (unit) {
			this.updateUnit(unit);
		},
		announcement: function (msg) {
			atom.log('Announcement: ', msg);
		}
	}
});