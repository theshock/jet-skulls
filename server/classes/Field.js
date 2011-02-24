

GLOBAL.Field = atom.Class({
	_units: {},

	initialize: function (width, height) {
		this.width  = width;
		this.height = height;
		
		(function () {
			this.links.invoke('send', {
				units: this.units,
				shots: this.shots
			});
		}.periodical(30, this));
	},

	_shots : [],
	get shots () {
		this._shots = this._shots.filter(function (shot) {
			return shot.dead > Date.now();
		});
		return this._shots;
	},

	shoot: function (shot) {
		var point = Point.from(shot);
		for (var i in this._units) {
			if (this._units[i].checkInjured(point)) {
				delete this._units[i];
			}
		}
		shot.id   = String.uniqueID();
		shot.dead = Date.now() + 1000;
		this._shots.push(shot);
	},

	get units () {
		var array = [];
		for (var i in this._units) {
			array.push(this._units[i].object);
		}
		return array;
	},

	get object () {
		return {
			width : this.width,
			height: this.height
		};
	},

	createUnit: function (id) {
		var unit = new Unit(id, this);
		this._units[id] = unit;
		return unit;
	},

	getUnit: function (id) {
		return this._units[id];
	},

	deleteUnit: function (unit) {
		delete this.units[unit.id];
		return this;
	},

	randomPoint: function () {
		return new Point(
			Number.random(0, this.width),
			Number.random(0, this.height)
		);
	},
	
	links: [],
	createLink: function (client) {
		var field = this,
		    unit  = field.createUnit(client.sessionId),
		    link  = new Link(this, client)
				.addEvent('connect', function () {
					link.announcement('connected');

					client.send({
						screen: field.object,
						player: unit.object,
						units : field.units,
					});
				})
				.addEvent('message', function (message) {
					if (message.unit && !unit.dead) {
						unit.update(message.unit);
					}
				})
				.addEvent('disconnect', function () {
					field.deleteUnit(unit);
					client.broadcast({ disconnected: link.id });
					link.announcement('disconnected');
				});
		this.links.push(link);
	}
});