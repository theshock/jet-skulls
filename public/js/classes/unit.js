var Unit = atom.Class({
	Implements: [Drawable],

	position: new Point(0,0),
	initialize: function (data) {
		this.update(data);
	},
	update: function (data) {
		this.id    = data.id;
		this.angle = data.angle || 0;
		this.position.moveTo(data.position);
		this.libcanvas && this.libcanvas.update();
	},
	viewPoint: function () {
		return this.position.clone()
			.move({ x: 15, y: 0 })
			.rotate(this.angle, this.position);
	},
	draw: function () {
		console.log(this.position.toObject(), this.viewPoint().toObject());
		this.libcanvas.ctx
			.stroke(new Circle(this.position, 10), 'red')
			.stroke(new Line  (this.position, this.viewPoint()), 'red')
	}
});