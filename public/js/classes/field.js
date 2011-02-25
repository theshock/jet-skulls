var Field = atom.Class({
	initialize: function (options) {
		this.libcanvas = new LibCanvas(options.element, {
			preloadImages: {
				aim : 'images/aim.png'
			},
			preloadAudio: {
				shot: 'sounds/shot.*:12'
			}
		}).start();
		this.link      = new Link(options.server).connect();

		this.link.addEvent('connect', this.start.context(this));
		this.link.addEvent('message', this.message.context(this));
	},

	start: function () {},

	shots: {},
	units: {},
	createUnit: function (unit) {
		unit = new Unit(unit, this);
		this.libcanvas.addElement(unit).update();
		this.units[unit.id] = unit;
		return unit;
	},
	getUnit: function (id) {
		return this.units[id];
	},
	updateUnit: function (unit) {
		if (this.units[unit.id]) {
			this.units[unit.id].update(unit);
		} else {
			this.createUnit(unit);
		}
		return this;
	},
	deleteUnit: function (id) {
		if (this.units[id]) {
			var unit = this.units[id];
			delete this.units[id];
			this.libcanvas.rmElement(unit);
		}
		return this;
	},

	message: function (data) {
		if ('player' in data || 'playerId' in this) {
			for (i in data) {
				if (i in this.actions) {
					this.actions[i].call(this, data[i])
				} else {
					atom.log('No action «' + i + '»');
				}
			}
		}
	},
	actions: {
		screen: function (screen) {
			this.libcanvas.set(screen);
		},
		player: function (player) {
			this.playerId = player.id;
			player.isPlayer = true;
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
			atom.log('Announcement: «' + msg + '»');
		},
		disconnect: function (unit) {
			this.deleteUnit(unit.id);
		},
		shots: function (shots) {
			for (var i = shots.length; i--;) {
				if (!this.shots[shots[i].id]) {
					this.shots[shots[i].id] = true;
					this.libcanvas.addElement(new Shot(this, shots[i]));
				}
			}
		},
		dead: function (death) {
			var id = death.unit.id;
			this.deleteUnit(id);
			if (id == this.playerId) {
				atom()
					.create('p')
					.css({
						font : 'bold 36px sans-serif',
						color: 'red',
						padding: '0 20px'
					})
					.html('You are dead!')
					.appendTo('body');
			}
		}
	}
});