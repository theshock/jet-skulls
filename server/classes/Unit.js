new function () {

var SQRT_2 = (2).sqrt();

GLOBAL.Unit = atom.Class({
	speed: 150,
	lastUpdate: 0,
	lastShot  : 0,
	health    : 100,
	weaponReload: 50,
	initialize: function (id, field) {
		this.id         = id;
		this.lastUpdate = Date.now();
		this.field      = field;
		this.position   = new Point(field.randomPoint());
	},
	update: function (status) {
		var now  = Date.now();
		var time = this.updateTime();

		// move
		var x = (status.move.x.limit(-1, 1) * this.speed * time);
		var y = (status.move.y.limit(-1, 1) * this.speed * time);

		if (x && y) {
			// todo: Использовать нормальную формулу
			x /= SQRT_2;
			y /= SQRT_2;
		}
		this.position.move({ x: x.round(), y: y.round() })

		// mouse
		if (status.mouse) {
			this.angle = Point.from(status.mouse).angleTo(this.position);

			// shot
			if (status.shot && this.lastShot + this.weaponReload < now) {
				this.lastShot = now;
				this.field.shoot(status.mouse, this);
			}
		}
	},
	checkInjured: function (bullet) {
		var hit = ((10 - this.position.distanceTo(bullet)) / 2).round();
		if (hit > 0) this.health -= hit;
		if (this.health <= 0) {
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
			health  : this.health
		}
	}
});

}