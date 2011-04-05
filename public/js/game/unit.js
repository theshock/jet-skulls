var Unit = atom.Class({
	Static: {
		count: 16
	},
	
	Implements: [Drawable],

	zIndex: 16,

	healthRectWidth: 30,
	healthRectHeight: 4,

	isPlayer: false,
	initialize: function (field, data) {
		this.healthShift = new Point(0, 15);
		this.position = new Point(0,0);

		this.field    = field;
		this.trace    = new Trace();
		this.isPlayer = !!data.isPlayer;
		this.zIndex   = this.genZ();
		this.positionTr = new Point(0,0);
		this.update(data);
	},
	genZ: function () {
		if (this.isPlayer) {
			return 128;
		}
		// могут быть баги, если сгенерируется много игроков, пока не критично
		if (++this.self.count >= 128) {
			this.self.count = 16;
		}
		return this.self.count;
	},
	update: function (data) {
		if (this.somethingChanged(data)) {
			this.id     = data.id;
			this.angle  = data.angle || 0;
			this.health = data.health;
			this.radius = data.radius;
			this.position.moveTo(data.position);
			if (this.libcanvas) this.libcanvas.update();
			this.trace.trace(this.position.x + '.' + this.position.y);
		}
	},
	somethingChanged: function (d) {
		var u = this;
		return !u.id ||
			!u.angle.equals(d.angle || 0) ||
			!u.health.equals(d.health) ||
			!u.position.equals(d.position);
	},
	_healthRect: null,
	_healthSprite: null,
	get healthColor() {
		var health = this.health;

		return health > 75 ? ['#090', '#060']:
		       health > 50 ? ['#0f0', '#090']:
		       health > 25 ? ['#ff0', '#990']:
		                     ['#f00', '#900'];
	},
	get healthSprite() {
		var unit   = this,
		    rect   = unit._healthRect,
			width  = unit.healthRectWidth,
			height = unit.healthRectHeight,
			sprite = unit._healthSprite,
			health = unit.health;
		if (!rect) {
			rect = unit._healthRect = new Rectangle({
				from:  new Point(0.5, 0.5),
				size: [width-1, height-1]
			});
			rect.toMax = function () {
				rect.width = width-1;
				return rect;
			};
			rect.toEnergy = function () {
				rect.width = (width-1) * unit.health / 100;
				return rect;
			};
		}
		if (!sprite) {
			sprite = unit._healthSprite = LibCanvas.Buffer(width, height, true);
		}
		if (sprite.health != health) {
			var color = this.healthColor;
			sprite.ctx
				.clearAll()
				.fill(rect.toEnergy(), color[0])
				.stroke(rect.toMax() , color[1])
			sprite.health = health;
		}
		return sprite;
	},
	viewPoint: function (translated) {
		return translated.clone()
			.move({ x: 25, y: 0 })
			.rotate(this.angle, translated);
	},
	draw: function () {
		var lc  = this.libcanvas;
		var pos = this.positionTr
			.moveTo(this.position)
			.move(this.field.translate);
		
		if (this.isPlayer && lc.mouse.inCanvas) {
			lc.ctx.drawImage({
				image : this.libcanvas.getImage('aim'),
				center: lc.mouse.point
			})
		}
		var color  = this.isPlayer ? 'green' : 'red';
		lc.ctx
			.drawImage({
				image : this.libcanvas.getImage(this.isPlayer ? 'player' : 'enemy'),
				center: pos,
				angle : this.angle || 0
			})
			.drawImage({
				image: this.healthSprite,
				center: pos.move(this.healthShift)
			});
	}
});