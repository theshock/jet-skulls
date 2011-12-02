
Jet.Battle.Player = Class({

	Extends: LibCanvas.Scene.Element,

	options: {
		control  : false,
		positionX: 8000,
		positionY: 8000,
		moveX: 0,
		moveY: 0,
		angle: 0,
		speed: 2 // 2 cells per second
	},

	initialize: function (scene, options) {
		this.shape = new Circle( 0, 0, 4 );
		this.parent( scene, options );
	},

	setOptions: function (options) {
		this.parent( options );
		options = this.options;
		this.shape.center.moveTo([
			(options.positionX * 32 / 1000).round(),
			(options.positionY * 32 / 1000).round()
		]);
		this.redraw();
	},

	renderTo: function (ctx) {
		var color = 'red', o = this.options;
		if (o.control) {
			color = 'green';
		} else if (o.moveX || o.moveY) {
			color = 'orange';
		}
		ctx.fill( this.shape, color );
		return this.parent(ctx);
	}

});