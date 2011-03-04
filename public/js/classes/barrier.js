
var Barrier = atom.Class({
	Implements: [Drawable],
	
	zIndex: 3,
	
	initialize: function (field, rect) {
		this.field  = field;
		this.rect   = Rectangle.from(rect);
		this.trRect = this.rect.clone().move(this.field.translate);
	},
	
	draw: function () {
		var rect = this.trRect
			.moveTo(this.rect)
			.move(this.field.translate);
			
		this.libcanvas.ctx.save()
			.set('lineWidth', 2)
			.fill(rect, '#3b362f')
			.stroke(rect, '#1f1d19')
			.restore();
	}
});