var Unit = atom.Class({
	Implements: [Drawable],

	isPlayer: false,
	position: new Point(0,0),
	initialize: function (data) {
		this.isPlayer = !!data.isPlayer;
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
			.move({ x: 20, y: 0 })
			.rotate(this.angle, this.position)
			.snapToPixel();
	},
	draw: function () {
		var lc = this.libcanvas;
		if (this.isPlayer && lc.mouse.inCanvas) {
			lc.ctx.stroke(new Circle(lc.mouse.point.snapToPixel(), 4), '#ff0')
		}
		var color = this.isPlayer ? 'green' : 'red';
		lc.ctx
			.stroke(new Circle(this.position.snapToPixel(), 10), color)
			.stroke(new Line  (this.position.snapToPixel(), this.viewPoint()), color)
	}
});