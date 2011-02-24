var Unit = atom.Class({
	Implements: [Drawable],

	position: new Point(0,0),
	initilize: function (data) {
		this.update(data);
	},
	update: function (data) {
		this.id    = data.id;
		this.angle = data.angle;
		this.position.moveTo(data.position);
	},
	draw: function () {
		this.libcanvas.ctx.stroke(
			new Circle(this.position, 10), 'red'
		);
	}
});