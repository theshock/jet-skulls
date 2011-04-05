

GLOBAL.Field = atom.Class({

	initialize: function (width, height) {
		this._units = {};
		this._shots = [];
		this.links  = [];
		this.barriers = [];
		
		this.width  = width;
		this.height = height;
		this.rect   = new Rectangle(0,0,width,height);
		
		(function () {
			this.links.invoke('send', {
				units: this.units,
				shots: this.shots
			});
		}.periodical(40, this));
	},

	get shots () {
		this._shots = this._shots.filter(function (shot) {
			return shot.dead > Date.now();
		});
		return this._shots;
	},
	
	bulletCollision: function (line) {
		var bar = this.barriers.lines, minDist = null, collis = null;
		for (var i = bar.length; i--;) {
			var inter = line.intersect(bar[i], true);
			if (inter) {
				var dist  = inter.distanceTo(line.from);
				if (minDist == null || dist < minDist) {
					minDist = dist;
					collis  = inter;
				}
			}
		}
		return collis;
	},

	shoot: function (shot, player) {
		var point = Point.from(shot);
		
		var line = new Line(player.position, point);
		
		var collis = this.bulletCollision(line);
		if (collis) {
			shot = collis.toObject();
		} else {
			for (var i in this._units) {
				var unit = this._units[i];
				if (unit.checkInjured(point)) {
					this.deleteUnit(unit);
					this.sendAll({ dead: { unit: unit.object }});
				}
			}
		}
		shot.owner = player.id;
		shot.id    = String.uniqueID();
		shot.dead  = Date.now() + 1000;
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
		delete this._units[unit.id];
		return this;
	},

	randomPoint: function () {
		return new Point(
			Number.random(0, this.width),
			Number.random(0, this.height)
		);
	},

	_barriersPlain: null,
	get barriesPlain () {
		if (!this._barriersPlain) {
			this._barriersPlain = this.barriers.map(function (bar) {
				bar = bar.rect;
				return [bar.from.x, bar.from.y, bar.width, bar.height];
			});
		}
		return this._barriersPlain;
	},
	
	createBarriers: function (a) {
		var lines = [];
		this.barriers = a.map(function (rect) {
			var bar  = new Barrier(this, rect);
			var from = bar.rect.from, to = bar.rect.to;
			lines.push(
				new Line([from.x, from.y], [  to.x, from.y]),
				new Line([  to.x,   to.y], [  to.x, from.y]),
				new Line([  to.x,   to.y], [from.x,   to.y]),
				new Line([from.x, from.y], [from.x,   to.y])
			);
			return bar;
		});
		this.barriers.lines = lines;
		return this;
	},
	
	sendAll: function (data) {
		this.links.invoke('send', data);
		return this;
	},

	createLink: function (client) {
		var field = this,
		    unit  = field.createUnit(client.sessionId),
		    link  = new Link(this, client)
				.addEvent('connect', function () {
					link.announcement('connected');

					client.send({
						screen  : field.object,
						player  : unit.object,
						barriers: field.barriesPlain,
						units   : field.units
					});
				})
				.addEvent('message', function (message) {
					if (message.unit && !unit.dead) {
						unit.update(message.unit);
					}
				})
				.addEvent('disconnect', function () {
					field.deleteUnit(unit);
					link.announcement('disconnected');
					field.links.erase(link);
					field.sendAll({ disconnected: link.id });
				});
		this.links.push(link);
	}
});