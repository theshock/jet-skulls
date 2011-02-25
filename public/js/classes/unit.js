var Unit = atom.Class({
	Static: {
		count: 0
	},
	
	Implements: [Drawable],

	zIndex: 16,
	
	healthShift: {x: 0, y: 15},
	healthRectWidth: 30,
	healthRectHeight: 4,

	isPlayer: false,
	position: new Point(0,0),
	initialize: function (data) {
		this.isPlayer = !!data.isPlayer;
		this.zIndex   = this.genZ();
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
			this.libcanvas && this.libcanvas.update();
		}
	},
	somethingChanged: function (d) {
		var u = this;
		return !u.id ||
			!u.angle.equals(d.angle || 0) ||
			!u.health.equals(d.health) ||
			!u.position.equals(d.position);
	},
	viewPoint: function () {
		return this.position.clone()
			.move({ x: 25, y: 0 })
			.rotate(this.angle, this.position)
			.snapToPixel();
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
	draw: function () {
		var lc = this.libcanvas;
		if (this.isPlayer && lc.mouse.inCanvas) {
			lc.ctx.drawImage({
				image : this.libcanvas.getImage('aim'),
				center: lc.mouse.point
			})
		}
		var color  = this.isPlayer ? 'green' : 'red';
		var circle = new Circle(this.position.snapToPixel(), this.radius);
		lc.ctx
			.stroke(new Line(this.position.snapToPixel(), this.viewPoint()), color)
			.fill(circle, 'black').stroke(circle, color)
			.drawImage({
				image: this.healthSprite,
				center: this.position.clone().move(this.healthShift)
			});
	}
});