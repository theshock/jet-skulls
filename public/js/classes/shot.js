var Shot = atom.Class({
	Implements: [
		Drawable,
		Animatable
	],

	zIndex: 5,

	initialize: function (field, data) {
		this.field      = field;
		this.owner      = field.getUnit(data.owner);
		this.id         = data.id;
		this.position   = new Point(data.x, data.y);
		this.radius     = 2;
		this.rayOpacity = 0.2;
		this.circle     = new Circle(0,0,this.radius);

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
		var translate = this.field.translate;
		var pos       = this.position.clone().move(translate);
		var circle    = this.circle;
		circle.center.moveTo(pos);
		circle.radius = this.radius;
		
		var ctx = this.libcanvas.ctx.fill(circle, '#300');
			
		if (this.rayOpacity) {
			ctx.save()
			   .set({ globalAlpha: this.rayOpacity })
			   .stroke(new Line(this.owner.position.clone().move(translate), pos), '#300')
			   .restore()
		}
	}
});