
var Barrier = atom.Class({
	Implements: [Drawable],
	
	initialize: function (field, rect) {
		this.field = field;
		this.rect  = Rectangle.from(rect);
	},
	
	draw: function () {
		var rect = this.rect.clone().move(this.field.translate);
		this.libcanvas.ctx.save()
			.set('lineWidth', 2)
			.fill(rect, '#030')
			.stroke(rect, '#090')
			.restore();
	}
});