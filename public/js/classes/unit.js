var Unit = atom.Class({
	Implements: [Drawable],
	initilize: function (data) {
		this.id       = data.id;
		this.position = new Point(data.position);
		this.angle    = data.angle;
	},
	draw: function () {
		this.libcanvas.ctx.stroke(
			new Circle(this.position, 10), 'red'
		);
	}
});