new function () {

var SQRT_2 = (2).sqrt();

GLOBAL.Unit = atom.Class({
	speed: 100,
	lastUpdate: 0,
	initialize: function (id, field) {
		this.id         = id;
		this.lastUpdate = Date.now();
		this.position   = new Point(field.randomPoint());
	},
	update: function (status) {
		var time = this.updateTime();
		if (status.move) {
			var x = (status.move.x.limit(-1, 1) * this.speed * time);
			var y = (status.move.y.limit(-1, 1) * this.speed * time);
			
			if (x && y) {
				// todo: Использовать нормальную формулу
				x /= SQRT_2;
				y /= SQRT_2;
			}
			this.position.move({ x: x.round(), y: y.round() })
		}
	},
	updateTime: function() {
		var now  = Date.now();
		var time = (Date.now() - this.lastUpdate).toSeconds();
		this.lastUpdate = now;
		// Избегаем читерства с долгим отсуствием запросов
		return time.limit(0.0, 0.1)
	},
	get object () {
		return {
			id: this.id,
			position : this.position.toObject()
		}
	}
});

}