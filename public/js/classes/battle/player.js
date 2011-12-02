
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

	get id () {
		return this.options.playerId;
	},

	initialize: function (scene, options) {
		this.shape = new Circle( 0, 0, 4 );
		this.parent( scene, options );
	},

	setOptions: function (options) {
		this.parent( options );
		options = this.options;
		this.shape.center.moveTo([
			(options.positionX * 16 / 1000).round(),
			(options.positionY * 16 / 1000).round()
		]);
		this.redraw();
	},

	/**
	 * @param {string} param
	 * @param {number} value
	 * @returns {Jet.Battle.Player}
	 */
	changeValue: function (param, value) {
		// прикрепляем ко всем изменяемым параметрам айди игрока
		var params = { playerId: this.id };
		params[param] = value;
		this.fireEvent( 'change', [ params ]);
		return this;
	},

	bindKeyboard: function () {
		var change = this.changeValue.bind(this);

		var keys = {
			// property; onDown; onUp
			w: [ 'moveY', -1, 0 ],
			s: [ 'moveY', +1, 0 ],
			a: [ 'moveX', -1, 0 ],
			d: [ 'moveX', +1, 0 ]
		};

		new LibCanvas.Keyboard().addEvent({
			'down': function (e) {
				if (this.keyState(e.keyName)) return;

				var result = keys[e.keyName];
				change(result[0], result[1]);
			},
			'up': function (e) {
				var result = keys[e.keyName];
				change(result[0], result[2]);
			}
		});
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