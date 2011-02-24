var Shot = atom.Class({
	Implements: [
		Drawable,
		Animatable
	],

	zIndex: 5,

	initialize: function (data) {
		this.id       = data.id;
		this.position = new Point(data.x, data.y);
		this.radius   = 2;

		this.addEvent('libcanvasSet', function () {
			this.animate({
				props: { radius : 0 },
				time : 2000,
				onProccess: this.libcanvas.update,
				onFinish: function () {
					this.libcanvas.rmElement(this);
				}.context(this)
			});
		});
	},

	draw: function () {
		this.libcanvas.ctx.fill(new Circle(this.position, this.radius), '#999');
	}
});