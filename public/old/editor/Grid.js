
var Grid = atom.Class({
	Extends: Layer,
	
	initialize: function () {
		this.parent.apply(this, arguments);
		
		this.engine.addTiles({
			empty: function (ctx, rect, tile) {
				rect = rect.snapToPixel();
				if (tile.x % 5 == 0 || tile.y % 5 == 0) {
					ctx.fill(rect, '#111');
				}
				ctx.stroke(rect, '#333');
			}
		}).update();
	}
});