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
		this.positionTr = this.position.clone();
		this.positionOw = this.owner.position.clone();
		this.rayOpacity = 0.2;
		this.circle     = new Circle(this.positionTr, 2);
		this.line       = new Line(this.positionOw, this.positionTr);

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
	
	get radius () {
		return this.circle.radius;
	},
	
	set radius (r) {
		this.circle.radius = r;
	},

	draw: function () {
		var translate = this.field.translate;
		
		this.positionTr.set(this.position).move(translate);
		this.positionOw.set(this.owner.position).move(translate)
		
		var ctx = this.libcanvas.ctx.fill(this.circle, '#300');
			
		if (this.rayOpacity) {
			ctx.save()
			   .set({ globalAlpha: this.rayOpacity })
			   .stroke(this.line, '#300')
			   .restore()
		}
	}
});