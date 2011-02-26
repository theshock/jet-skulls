
var Barrier = atom.Class({
	Implements: [Drawable],
	
	zIndex: 3,
	
	initialize: function (field, rect) {
		this.field = field;
		this.rect  = Rectangle.from(rect);
	},
	
	isHidden: function () {
		var vp = this.field.viewPort, rect = this.rect;
		return rect.width  < vp.width &&
		       rect.height < vp.height &&
			(!rect.from.x.between(vp.from.x, vp.to.x)) &&
			(!rect.from.y.between(vp.from.y, vp.to.y)) && 
			(!rect. to .x.between(vp.from.x, vp.to.x)) &&
			(!rect. to .y.between(vp.from.y, vp.to.y));
	},
	
	draw: function () {
		if (this.isHidden()) return;
		
		var rect = this.rect.clone().move(this.field.translate);
		this.libcanvas.ctx.save()
			.set('lineWidth', 2)
			.fill(rect, '#3b362f')
			.stroke(rect, '#1f1d19')
			.restore();
	}
});