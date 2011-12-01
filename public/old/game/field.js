
// todo: разделить на файлы App и Field
var Field = atom.Class({
	Implements: [Drawable],
	
	zIndex: 1,
	
	initialize: function (options) {
		this.shots = {};
		this.units = {};
		this._translate = new Point(0, 0);

		new LibCanvas(options.element, {
			preloadImages: {
				aim   : 'images/aim.png',
				player: 'images/man-green.png',
				enemy : 'images/man-red.png'
			},
			preloadAudio: {
				shot: 'sounds/shot.*:8'
			}
		})
		.size(options.screen, true)
		.start()
		.addElement(this);
		
		this.translateTrace = new Trace();
		this.screen = options.screen;
			
		this.link = new Link(options.server).connect()
			.addEvent('connect', this.start.context(this))
			.addEvent('message', this.message.context(this));
	},

	start: function () {},
	
	get player () {
		return 'playerId' in this ? this.getUnit(this.playerId) : null;
	},
	createUnit: function (unit) {
		unit = new Unit(this, unit);
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

	get translate () {
		if (!this.player) return new Point(0,0);
		
		var pos = this.player.position, tr = this._translate
		
		// todo: если игрок не двигается, то классы не должны транслировать объекты
		if ( !tr.player || !pos.equals(tr.player) ) {
			if (tr.player) {
				tr.player.moveTo(pos)
			} else {
				tr.player = pos.clone();
			}
			tr.moveTo({
				x: this.screen.width  / 2 - pos.x,
				y: this.screen.height / 2 - pos.y
			});
		}
		return tr;
	},
	
	// #todo: optimize by caching
	get viewPort () {
		if (!this.player) return new Rect(0,0, this.screen.width, this.screen.height);
		
		var pos = this.player.position;
		return new Rectangle({
			from: {
				x: pos.x - this.screen.width  / 2,
				y: pos.y - this.screen.height / 2
			},
			size: this.screen
		})
	},
	draw: function () {
		if (!this.fieldRect) return;
		
		var rect = this.fieldRect.clone().move(this.translate);
		this.libcanvas.ctx.save()
			.set('lineWidth', 4)
			.fill(rect, '#938775')
			.stroke(rect, '#4f3f27')
			.restore();
	},
	
	fieldRect: null,
	createFieldRect: function (size) {
		this.fieldRect = new Rectangle({ from: [0, 0], size: size });
		return this;
	},

	message: function (data) {
		if ('player' in data || 'playerId' in this) {
			for (var i in data) {
				if (i in this.actions) {
					this.actions[i].call(this, data[i])
				} else {
					atom.log('No action «' + i + '»');
				}
			}
		}
	},
	actions: {
		barriers: function (barriers) {
			for (var i = barriers.length; i--;) {
				this.libcanvas.addElement(
					new Barrier(this, barriers[i])
				);
			}
		},
		screen: function (screen) {
			this.createFieldRect(screen);
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
		disconnected: function (unit) {
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
				atom.dom()
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