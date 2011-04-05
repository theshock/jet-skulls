
var Mouse = atom.Class({
	Extends: Layer,
	
	hidden: true,
	mouseActive: false,
	style: 'rgba(255,0,0,.3)',
	
	initialize: function () {
		this.parent.apply(this, arguments);
		
		this.size   = this.options.cellSize;
		this.rect   = new Rectangle(0,0,this.size,this.size);
		this.mouse  = this.layer.mouse;
		this.layer
			.addFunc  (this.update.context(this))
			.addRender(this.render.context(this))
			.mouse.debug();
			
		this.trace = new Trace;
	},
	
	getHoverRect: function () {
		if (this.mouse.inCanvas) {
			var cell = this.engine.getCell(
				this.mouse.point.clone().move(this.editor.currentShiftPx)
			);
			return cell ? this.engine.getRect(cell).snapToPixel() : null;
		}
		return null;
	},
	
	createEngine: function () {
		return this.editor.tileEngine( atom.dom().create('canvas').first );
	},
	
	update: function () {
		this.trace.value = this.editor.currentShiftPx;
		
		var rect = this.getHoverRect(), update = this.layer.update;
		if (rect) {
			if (!rect.equals(this.rect)) {
				this.rect.moveTo(rect);
				update();
			} else if (this.hidden) {
				update();
			}
			this.hidden = false;
		} else {
			update();
			this.hidden = true;
		}
	},
	
	render: function () {
		if (!this.hidden) this.layer.ctx.fill(this.rect, this.style);
	}
});