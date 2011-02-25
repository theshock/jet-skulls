var Shot = atom.Class({
	Implements: [
		Drawable,
		Animatable
	],

	zIndex: 5,

	initialize: function (field, data) {
		this.owner    = field.getUnit(data.owner);
		this.start    = field.getUnit(data.owner).position.clone();
		this.id       = data.id;
		this.position = new Point(data.x, data.y);
		this.radius   = 2;
		this.rayOpacity = 0.2;

		this.addEvent('libcanvasSet', function () {
			this.animate({
				props: { radius : 0 },
				time : 2000,
				onProccess: this.libcanvas.update,
				onFinish: function () {
					this.libcanvas.rmElement(this);
				}.context(this)
			});
			this.animate({
				props: { rayOpacity: 0 },
				time: 200,
				onProccess: this.libcanvas.update,
				onFinish: function () {
					this.rayOpacity = false;
				}.context(this)
			});
			this.libcanvas.getAudio('shot').playNext();
		});
	},

	draw: function () {
		var ctx = this.libcanvas.ctx
			.fill(new Circle(this.position, this.radius), '#a96');
			
		if (this.rayOpacity) {
			ctx.save()
			   .set({ globalAlpha: this.rayOpacity })
			   .stroke(new Line(this.owner.position, this.position), '#fda')
			   .restore()
		}
	}
});