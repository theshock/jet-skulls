new function () {
	
GLOBAL.Barrier = atom.Class({
	initialize: function (field, rect) {
		this.field = field;
		this.rect  = Rectangle.from(rect);
	}
});

};