var Unit = atom.Class({
	Implements: [Drawable],

	position: new Point(0,0),
	initialize: function (data) {
		this.update(data);
	},
	update: function (data) {
		this.id    = data.id;
		this.angle = data.angle;
		this.position.moveTo(data.position);
		this.libcanvas && this.libcanvas.update();
	},
	draw: function () {
		this.libcanvas.ctx.stroke(
			new Circle(this.position, 10), 'red'
		);
	}
});