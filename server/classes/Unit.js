new function () {

var SQRT_2 = (2).sqrt();

GLOBAL.Unit = atom.Class({
	_speed: 200,
	lastUpdate: 0,
	lastShot  : 0,
	radius    : 7,
	health    : 100,
	weaponReload:200,
	initialize: function (id, field) {
		this.id         = id;
		this.lastUpdate = Date.now();
		this.field      = field;
		this.position   = new Point(field.randomPoint());
	},
	get speed () {
		return this._speed - (100 - this.health);
	},
	update: function (status) {
		var now  = Date.now();
		var time = this.updateTime();
		
		// mouse
		if (status.mouse) {
			this.angle = Point.from(status.mouse).angleTo(this.position);

			// shot
			if (status.shot && this.lastShot + this.weaponReload < now) {
				this.lastShot = now;
				this.field.shoot(status.mouse, this);
			}
		}

		// move
		var x = (status.move.x.limit(-1, 1) * this.speed * time);
		var y = (status.move.y.limit(-1, 1) * this.speed * time);

		if (x || y) {
			if (x && y) {
				// У нас движение НЕ завязано на мышь
				x /= SQRT_2;
				y /= SQRT_2;
				var distance = Math.hypotenuse(x, y);
			} else {
				distance = x || y;
			}
			
			x = x.round();
			y = y.round();
			
			// предположительное месторасположение
			var dir = [new Point(x,y), new Point(x,0), new Point(0,y)];
			for (var i = 0; i < dir.length; i++) {
				var newPos = this.position.clone().move(dir[i]);
				if (!this.isCollisionIn(newPos)) {
					this.position.move(dir[i]);
					break;
				}
			}
		}
	},
	isCollisionIn: function (position) {
		var diameter = this.radius*2;
		if (!this.field.rect.hasPoint(position, this.radius)) return true;
		
		for (var i in this.field._units) {
			var unit = this.field._units[i];
			if (unit != this && unit.position.distanceTo(position) < diameter) {
				return true;
			}
		}
		return false;
	},
	checkInjured: function (bullet) {
		var hit = ((10 - this.position.distanceTo(bullet)) / 2).round();
		if (hit > 0) this.health -= hit;
		if (this.health <= 0) {
			this.health = 0;
			this.dead = true;
			return true;
		}
		return false;
	},
	updateTime: function() {
		var now  =  Date.now();
		var time = (Date.now() - this.lastUpdate).toSeconds();
		this.lastUpdate = now;
		// Избегаем читерства с долгим отсуствием запросов
		return time.limit(0.0, 0.1)
	},
	get object () {
		return {
			id      : this.id,
			position: this.position.toObject(),
			angle   : this.angle,
			health  : this.health,
			radius  : this.radius
		}
	}
});

}