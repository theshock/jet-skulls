
var Editor = atom.Class({
	Implements: [atom.Class.Options],
	options: {
		width : 16,
		height: 16,
		shiftCells: .5,
		cellSize: 32,
		screen: {
			width : 24,
			height: 15
		}
	},
	map: [],
	initialize: function (options) {
		var o = this.setOptions(options).options;
		
		
		var cont = this.container = atom.dom(o.container);
		
		var lc = this.libcanvas = new LibCanvas(cont.find('canvas'), {
				preloadImages: {
					blocked: '/images/blocked.png',
					sprites: '/images/landscape-sprites.png'
				}
			})
			.size(o.screen.width*o.cellSize, o.screen.height*o.cellSize, true)
			.start()
			.addEvent('ready', function () {
				this.initMouse();
				this.initKeyboard();
				this.createLayers();
			}.context(this));
		
	},
	createLayers: function () {
		var lc = this.libcanvas, editor = this;
		this.map.append([
			['grid'      , Grid],
			['landscape' , Landscape],
			['collisions', Collisions],
			['mouse'     , Mouse]
		].map(function (elem) {
			return new elem[1](editor, lc.createLayer(elem[0]));
		}))
	},
	
	initMouse: function () {
		this.libcanvas.listenMouse();
		return;
	},
	
	initKeyboard: function () {
		var o = this.options, c = o.shiftCells;
		
		var shift   = new Point(0, 0);
		
		var lc = this.libcanvas.listenKeyboard()
			.addFunc(function () {
				var key = lc.getKey.context(lc);
				shift.x = (key('aleft') ? -1 : key('aright') ? 1 : 0) * c;
				shift.y = (key('aup')   ? -1 : key('adown')  ? 1 : 0) * c;
				this.shiftMap(shift);
			}.context(this));
	},
	
	currentShift: new Point(0,0),
	currentShiftPx: new Point(0,0),
	shiftMap: function (shift) {
		var o = this.options, s = o.screen;
		var newX = this.currentShift.x + shift.x;
		var newY = this.currentShift.y + shift.y;
		if (newX < -2 || newX > o.width  - s.width  + 2) shift.x = 0;
		if (newY < -2 || newY > o.height - s.height + 2) shift.y = 0;
		
		
		this.currentShift.move(shift);
		shift.mul(this.options.cellSize);
		this.currentShiftPx.move(shift);
		this.map.invoke('shift', this.currentShiftPx);
		return this;
	},
	
	tileEngine: function (layer) {
		var o = this.options;
		return new LibCanvas.Engines.Tile(layer)
			.setSize(o.cellSize, o.cellSize)
			.createMatrix(o.width, o.height, 'empty');
	},
	get fieldSize () {
		var o = this.options;
		return {
			width : o.width  * o.cellSize,
			height: o.height * o.cellSize
		};
	}
});