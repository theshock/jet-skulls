
Jet.Battle.Player = Class({

	Extends: LibCanvas.Scene.Element,

	options: {
		disconnected: false,
		control  : false,
		sightX   : 8000,
		sightY   : 8000,
		positionX: 8000,
		positionY: 8000,
		moveX: 0,
		moveY: 0,
		speed: 2 // 2 cells per second
	},

	get id () {
		return this.options.playerId;
	},

	initialize: function (scene, options) {
		this.shape = new Rectangle( 0, 0, 20, 20 );
		this.parent( scene, options );
	},

	toClientCoordinates: function (point) {
		return new Point(point).mul( Jet.Controller.MAP_TILE_SIZE / 1000 );
	},

	toServerCoordinates: function (point) {
		return new Point(point).mul( 1000 / Jet.Controller.MAP_TILE_SIZE ).invoke('round');
	},

	setOptions: function (options) {
		this.parent( options );
		options = this.options;
		this.shape.moveTo(this.toClientCoordinates(
			[options.positionX, options.positionY]
		).move([ -8, -8 ]));
		this.redraw();
	},

	/**
	 * @param {String/Object} param
	 * @param {number} [value=null]
	 * @returns {Jet.Battle.Player}
	 */
	changeValue: function (param, value) {
		// прикрепляем ко всем изменяемым параметрам айди игрока
		if (typeof param == 'string') {
			var params = {};
			params[param] = value;
			return this.changeValue(params);
		}
		param.playerId = this.id;
		this.fireEvent( 'change', [ param ]);
		return this;
	},

	get currentBoundingShape () {
		return this.shape.clone().grow(6);
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
				if (result) change(result[0], result[1]);
			},
			'up': function (e) {
				var result = keys[e.keyName];
				if (result) change(result[0], result[2]);
			}
		});
	},

	bindMouse: function () {
		var mouse = this.scene.libcanvas.mouse;
		mouse.addEvent( 'move', function(e){
			var sight = this.toServerCoordinates(e.offset);
			this.changeValue({
				sightX: sight.x,
				sightY: sight.y
			});
		}.bind(this));
	},

	renderTo: function (ctx) {
		var type = 'enemy', o = this.options;
		if (o.disconnected) {
			type = 'inactive';
		} else if (o.control) {
			type = 'own';
		}
		ctx.drawImage({
			image: this.scene.resources.getImage( 'player-' + type ),
			draw : this.shape,
			angle: this.toClientCoordinates([o.sightX, o.sightY]).angleTo(this.shape.center),
			optimize: true
		});
		return this.parent(ctx);
	}

});