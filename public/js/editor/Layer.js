
var Layer = atom.Class({
	Implements: [ atom.Class.Options ],
	
	options: {},
	
	initialize: function (editor, layer) {
		var o = this.options = editor.options;
		
		this.editor = editor;
		this.layer  = layer.size({
			width : o.width  * o.cellSize + 1,
			height: o.height * o.cellSize + 1,
		});
		this.engine = this.createEngine();
	},
	
	createEngine: function () {
		return this.editor.tileEngine( this.layer );
	},
	
	shift: function (value) {
		this.layer.shift(-value.y, -value.x);
		return this;
	}
	
});