
/*
---

name: "LibCanvas"

description: "LibCanvas - free javascript library, based on AtomJS framework."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

...
*/

(function (atom, Math) { // LibCanvas

// bug in Safari 5.1 ( 'use strict' + 'set prop' )
// 'use strict';

var undefined, Class = atom.Class;
/*
---

name: "LibCanvas"

description: "LibCanvas initialization"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: LibCanvas

...
*/

var LibCanvas = this.LibCanvas = Class(
/** @lends LibCanvas.prototype */
{
	Static: {
		Buffer: function (width, height, withCtx) {
			var a = Array.pickFrom(arguments), zero = (width == null || width === true);
			if (zero || width.width == null || width.height == null) {
				width   = zero ? 0 : a[0];
				height  = zero ? 0 : a[1];
				withCtx = zero ? a[0] : a[2];
			} else {
				withCtx = !!height;
				height  = width.height;
				width   = width.width
			}
			
			var canvas = atom.dom
				.create("canvas", {
					width  : width,
					height : height
				}).get();
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		isLibCanvas: function (elem) {
			return elem && elem instanceof Canvas2D;
		},
		namespace: function (namespace) {
			var current;
			Array.from(arguments).forEach(function (namespace) {
				current = LibCanvas;
				namespace.split('.').forEach(function(part){
					if (current[part] == null) current[part] = {};
					current = current[part];
				});
			});
			return current;
		},
		extract: function (to) {
			to = to || atom.global;

			for (var i in {Shapes: 1, Behaviors: 1, Utils: 1}) {
				for (var k in LibCanvas[i]) {
					to[k] = LibCanvas[i][k];
				}
			}
			for (i in {Point: 1, Animation: 1, Processors: 1, Context2D: 1}) {
				to[i] = LibCanvas[i];
			}
			return to;
		},

		get invoker () {
			if (this._invoker == null) {
				this._invoker = new Invoker().invoke();
			}
			return this._invoker;
		}
	},
	/**
	 * @constructs
	 * @returns {LibCanvas.Canvas2D}
	 */
	initialize: function() {
		return Canvas2D.factory(arguments);
	}
});

LibCanvas.Animation  = {};
LibCanvas.Behaviors  = {};
LibCanvas.Engines    = {};
LibCanvas.Inner      = {};
LibCanvas.Processors = {};
LibCanvas.Scene      = {};
LibCanvas.Shapes     = {};
LibCanvas.Ui         = {};
LibCanvas.Utils      = {};

var
	Inner      = LibCanvas.Inner,
	Processors = LibCanvas.Processors,
	Buffer     = LibCanvas.Buffer,
	Scene      = LibCanvas.Scene;

/*
---

name: "Geometry"

description: "Base for such things as Point and Shape"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Geometry

...
*/

var Geometry = LibCanvas.Geometry = Class(
/**
 * @lends LibCanvas.Geometry.prototype
 * @augments Class.Events.prototype
 */
{
	Implements: Class.Events,
	Static: {
		invoke: function (obj) {
			if (obj == null) throw new TypeError( 'element is not geometry' );

			return (typeof obj == 'object' && obj[0] instanceof this) ?
				obj[0] : (obj instanceof this ? obj : new this(obj));
		},
		from : function (obj) {
			return this(obj);
		}
	},
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	invertDirection: function (distance, reverse) {
		distance = Point( distance );
		var multi = reverse ? -1 : 1;
		return {
			x : distance.x * multi,
			y : distance.y * multi
		};
	},
	move : function (distance, reverse) {
		this.fireEvent('move', [this.invertDirection(distance, reverse)]);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Geometry]')
});

/*
---

name: "Utils.Math"

description: "Helpers for basic math operations, such as degree, hypotenuse from two cathetus, etc"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Utils.Math

...
*/

// Number
(function () {

	var degreesCache = {}, d360;

	atom.implement(Number, {
		/**
		 * Cast degrees to radians
		 * (90).degree() == Math.PI/2
		 */
		degree: function () {
			return this in degreesCache ? degreesCache[this] :
				this * Math.PI / 180;
		},
		/**
		 * Cast radians to degrees
		 * (Math.PI/2).getDegree() == 90
		 */
		getDegree: function (round) {
			return arguments.length == 0 ?
				this / Math.PI * 180 :
				this.getDegree().round(round);
		},
		normalizeAngle : function () {
			var num  = this % d360;
			return num < 0 ? num + d360 : num;
		},
		normalizeDegree : function (base) {
			return this
				.getDegree()
				.round(base || 0)
				.degree()
				.normalizeAngle();
		},

		toSeconds: function () {
			return this / 1000;
		},
		toMinutes: function () {
			return this / 60 / 1000;
		},
		toHours: function () {
			return this / 60 / 60 / 1000;
		},

		seconds: function () {
			return this * 1000;
		},
		minutes: function () {
			return this * 60 * 1000;
		},
		hours: function () {
			return this * 60 * 60 * 1000;
		}

	});

	degreesCache = [0, 45, 90, 135, 180, 225, 270, 315, 360]
		.associate(function (num) {
			return num.degree();
		});
	d360 = degreesCache[360];

})();

atom.extend(Math, {
	hypotenuse: function (cathetus1, cathetus2)  {
		return (cathetus1*cathetus1 + cathetus2*cathetus2).sqrt();
	},
	cathetus: function (hypotenuse, cathetus2)  {
		return (hypotenuse*hypotenuse - cathetus2*cathetus2).sqrt();
	}
});

/*
---

name: "Point"

description: "A X/Y point coordinates encapsulating class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Utils.Math

provides: Point

...
*/

var Point = LibCanvas.Point = function () {

var shifts = {
	top    : {x: 0, y:-1},
	right  : {x: 1, y: 0},
	bottom : {x: 0, y: 1},
	left   : {x:-1, y: 0},
	t      : {x: 0, y:-1},
	r      : {x: 1, y: 0},
	b      : {x: 0, y: 1},
	l      : {x:-1, y: 0},
	tl     : {x:-1, y:-1},
	tr     : {x: 1, y:-1},
	bl     : {x:-1, y: 1},
	br     : {x: 1, y: 1}
};

return Class(
/**
 * @lends LibCanvas.Point.prototype
 * @augments LibCanvas.Geometry.prototype
 */
{
	Extends: Geometry,

	Static: { shifts: shifts },

	/**
	 * @constructs
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {LibCanvas.Point}
	 */
	set : function (x, y) {
		var args = arguments;
		if (atom.typeOf(x) == 'arguments') {
			args = x;
			x = args[0];
			y = args[1];
		}
		if (args.length != 2) {
			if (x && x[0] !== undefined && x[1] !== undefined) {
				y = x[1];
				x = x[0];
			} else if (x && x.x !== undefined && x.y !== undefined) {
				y = x.y;
				x = x.x;
			} else {
				//atom.log('Wrong Arguments In Point.Set:', arguments);
				throw new TypeError('Wrong Arguments In Point.Set: [' + atom.toArray(arguments).join(', ') + ']');
			}
		}
		this.x = x == null ? null : Number(x);
		this.y = y == null ? null : Number(y);
		return this;
	},
	/** @returns {LibCanvas.Point} */
	move: function (distance, reverse) {
		distance = this.invertDirection(Point(distance), reverse);
		this.x += distance.x;
		this.y += distance.y;

		return this.parent(distance, false);
	},
	/** @returns {LibCanvas.Point} */
	moveTo : function (newCoord) {
		return this.move(this.diff(Point(arguments)));
	},
	/** @returns {Number} */
	angleTo : function (point) {
		var diff = Point(arguments).diff(this);
		return Math.atan2(diff.y, diff.x).normalizeAngle();
	},
	/** @returns {Number} */
	distanceTo : function (point) {
		var diff = Point(arguments).diff(this);
		return Math.hypotenuse(diff.x, diff.y);
	},
	/** @returns {LibCanvas.Point} */
	diff : function (point) {
		return new Point(arguments).move(this, true);
	},
	/** @returns {LibCanvas.Point} */
	rotate : function (angle, pivot) {
		pivot = Point(pivot || {x: 0, y: 0});
		if (this.equals(pivot)) return this;
		
		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		// TODO: check, maybe here should be "sides.y, sides.x" ?
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	/** @returns {LibCanvas.Point} */
	scale : function (power, pivot) {
		pivot = Point(pivot || {x: 0, y: 0});
		var diff = this.diff(pivot), isObject = typeof power == 'object';
		return this.moveTo({
			x : pivot.x - diff.x  * (isObject ? power.x : power),
			y : pivot.y - diff.y  * (isObject ? power.y : power)
		});
	},
	/** @returns {LibCanvas.Point} */
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	/** @returns {LibCanvas.Point} */
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	/** @returns {LibCanvas.Point} */
	getNeighbour : function (dir) {
		return this.clone().move(shifts[dir]);
	},
	/** @returns {LibCanvas.Point[]} */
	get neighbours () {
		return this.getNeighbours( true );
	},
	/** @returns {LibCanvas.Point[]} */
	getNeighbours: function (corners, asObject) {
		var shifts = ['t', 'l', 'r', 'b'], result, i, dir;

		if (corners) shifts.push('tl', 'tr', 'bl', 'br');

		if (asObject) {
			result = {};
			for (i = shifts.length; i--;) {
				dir = shifts[i];
				result[dir] = this.getNeighbour( dir );
			}
			return result;
		} else {
			return shifts.map(this.getNeighbour.bind(this));
		}
	},
	/** @returns {boolean} */
	equals : function (to, accuracy) {
		to = Point(to);
		return accuracy == null ? (to.x == this.x && to.y == this.y) :
			(this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy));
	},
	/** @returns {object} */
	toObject: function () {
		return {
			x: this.x,
			y: this.y
		};
	},
	/** @returns {LibCanvas.Point} */
	invoke: function (method) {
		this.x = this.x[method]();
		this.y = this.y[method]();
		return this;
	},
	/** @returns {LibCanvas.Point} */
	mean: function (points) {
		var l = points.length, i = l, x = 0, y = 0;
		while (i--) {
			x += points[i].x;
			y += points[i].y;
		}
		return this.set(x/l, y/l);
	},
	/** @returns {LibCanvas.Point} */
	snapToPixel: function () {
		this.x += 0.5 - (this.x - this.x.floor());
		this.y += 0.5 - (this.y - this.y.floor());
		return this;
	},
	/** @returns {LibCanvas.Point} */
	reverse: function () {
		this.x *= -1;
		this.y *= -1;
		return this;
	},
	/** @returns {LibCanvas.Point} */
	clone : function () {
		return new this.self(this);
	},
	/** @returns {string} */
	dump: function () {
		return '[Point(' + this.x + ', ' + this.y + ')]';
	},
	toString: Function.lambda('[object LibCanvas.Point]')
});

}();

/*
---

name: "Shape"

description: "Abstract class LibCanvas.Shape defines interface for drawable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Point

provides: Shape

...
*/

var shapeTestBuffer = function () {
	if (!shapeTestBuffer.buffer) {
		return shapeTestBuffer.buffer = Buffer(1, 1, true);
	}
	return shapeTestBuffer.buffer;
};

var Shape = LibCanvas.Shape = Class(
/**
 * @lends LibCanvas.Shape.prototype
 * @augments LibCanvas.Geometry.prototype
 */
{
	Extends    : Geometry,
	set        : Class.abstractMethod,
	hasPoint   : Class.abstractMethod,
	processPath: Class.abstractMethod,
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	// Методы ниже рассчитывают на то, что в фигуре есть точки from и to
	getCoords : function () {
		return this.from;
	},
	/** @returns {LibCanvas.Shape} */
	grow: function (size) {
		if (typeof size == 'number') {
			size = new Point(size/2, size/2);
		} else {
			size = new Point(size);
			size.x /= 2;
			size.y /= 2;
		}

		this.from.move(size, true);
		this. to .move(size);
		return this;
	},
	get x () {
		return this.getCoords().x;
	},
	get y () {
		return this.getCoords().y;
	},
	set x (x) {
		return this.move({ x : x - this.x, y : 0 });
	},
	set y (y) {
		return this.move({ x : 0, y : y - this.y });
	},
	get bottomLeft () {
		return new Point(this.from.x, this.to.y);
	},
	get topRight () {
		return new Point(this.to.x, this.from.y);
	},
	get center () {
		return new Point(
			(this.from.x + this.to.x) / 2,
			(this.from.y + this.to.y) / 2
		);
	},
	getBoundingRectangle: function () {
		return new Rectangle( this.from, this.to );
	},
	getCenter : function () {
		return this.center;
	},
	move : function (distance, reverse) {
		distance = this.invertDirection(distance, reverse);
		this.fireEvent('beforeMove', distance);
		this.from.move(distance);
		this. to .move(distance);
		return this.parent(distance);
	},
	equals : function (shape, accuracy) {
		return shape instanceof this.self &&
			shape.from.equals(this.from, accuracy) &&
			shape.to  .equals(this.to  , accuracy);
	},
	clone : function () {
		return new this.self(this.from.clone(), this.to.clone());
	},
	getPoints : function () {
		return { from : this.from, to : this.to };
	},
	dump: function (shape) {
		if (!shape) return this.toString();
		var p = function (p) { return '[' + p.x + ', ' + p.y + ']'; };
		return '[shape ' + shape + '(from'+p(this.from)+', to'+p(this.to)+')]';
	},
	toString: Function.lambda('[object LibCanvas.Shape]')
});

/*
---

name: "Shapes.Rectangle"

description: "Provides rectangle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Rectangle

...
*/

/** @name Rectangle */
var Rectangle = LibCanvas.Shapes.Rectangle = Class(
/**
 * @lends LibCanvas.Shapes.Rectangle.prototype
 * @augments LibCanvas.Shape.prototype
 */
{
	Extends: Shape,
	/**
	 * @constructs
	 * @param {number} fromX
	 * @param {number} fromY
	 * @param {number} width
	 * @param {number} height
	 * @returns {LibCanvas.Shapes.Rectangle}
	 */
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = this.from.clone().move({x:a[2], y:a[3]});
		} else if (a.length == 2) {
			if ('width' in a[1] && 'height' in a[1]) {
				this.set({ from: a[0], size: a[1] });
			} else {
				this.from = Point(a[0]);
				this.to   = Point(a[1]);
			}
		} else {
			a = a[0];
			if (a.from) {
				this.from = Point(a.from);
			} else if ('x' in a && 'y' in a) {
				this.from = new Point(a.x, a.y);
			}
			if (a.to) this.to = Point(a.to);
		
			if (!a.from || !a.to) {
				var as = a.size, size = {
					x : (as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]).pick(),
					y : (as ? [as.h, as[1], as.height] : [ a.h, a.height ]).pick()
				};
				this.from ?
					(this.to = this.from.clone().move(size, 0)) :
					(this.from = this.to.clone().move(size, 1));
			}
		
		}
		return this;
	},

	get width() {
		return this.to.x - this.from.x;
	},
	get height() {
		return this.to.y - this.from.y;
	},
	set width (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
	},
	set height (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
	},
	get size () {
		return {
			width : this.width,
			height: this.height
		};
	},
	set size (size) {
		if (size.width != this.width || size.height != this.height) {
			this.to.moveTo([ this.from.x + size.width, this.from.y + size.height ]);
		}
	},
	// @deprecated 
	getWidth : function () {
		return this.width;
	},
	// @deprecated
	getHeight : function () {
		return this.height;
	},
	// @deprecated 
	setWidth : function (width) {
		this.width = width;
		return this;
	},
	// @deprecated
	setHeight : function (height) {
		this.height = height;
		return this;
	},
	/** @returns {boolean} */
	hasPoint : function (point, padding) {
		point   = Point(arguments);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& point.x.between(Math.min(this.from.x, this.to.x) + padding, Math.max(this.from.x, this.to.x) - padding, 1)
			&& point.y.between(Math.min(this.from.y, this.to.y) + padding, Math.max(this.from.y, this.to.y) - padding, 1);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	align: function (rect, sides) {
		if (sides == null) sides = 'center middle';

		var moveTo = this.from.clone();
		if (sides.indexOf('left') != -1) {
			moveTo.x = rect.from.x;
		} else if (sides.indexOf('center') != -1) {
			moveTo.x = rect.from.x + (rect.width - this.width) / 2;
		} else if (sides.indexOf('right') != -1) {
			moveTo.x = rect.to.x - this.width;
		}

		if (sides.indexOf('top') != -1) {
			moveTo.y = rect.from.y;
		} else if (sides.indexOf('middle') != -1) {
			moveTo.y = rect.from.y + (rect.height - this.height) / 2;
		} else if (sides.indexOf('bottom') != -1) {
			moveTo.y = rect.to.y - this.height;
		}

		return this.moveTo( moveTo );
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	moveTo: function (rect) {
		if (rect instanceof Point) {
			this.move( this.from.diff(rect) );
		} else {
			rect = Rectangle(arguments);
			this.from.moveTo(rect.from);
			this.  to.moveTo(rect.to);
		}
		return this;
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			Math.min(this.from.x, this.to.x),
			Math.min(this.from.y, this.to.y),
			this.width .abs(),
			this.height.abs()
		]);
		return this;
	},
	/** @returns {LibCanvas.Context2D} */
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.ctx2d.rect( this.from.x, this.from.y, this.width, this.height );
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	/** @returns {boolean} */
	intersect : function (obj) {
		if (obj.self != this.self) {
			if (obj.getBoundingRectangle) {
				obj = obj.getBoundingRectangle();
			} else return false;
		}
		return this.from.x < obj.to.x && this.to.x > obj.from.x
			&& this.from.y < obj.to.y && this.to.y > obj.from.y;
	},
	getBoundingRectangle: function () {
		return this;
	},
	/** @returns {LibCanvas.Point} */
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new Point(
			Number.random(margin, this.width  - margin),
			Number.random(margin, this.height - margin)
		);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.width ) * this.width,
			y : (diff.y / fromRect.height) * this.height
		});
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	fillToPixel: function () {
		var from = this.from, to = this.to,
			point = function (method, invoke) {
				return new Point(
					Math[method](from.x, to.x),
					Math[method](from.y, to.y)
				).invoke( invoke );
			};

		return new Rectangle(
			point( 'min', 'floor' ),
			point( 'max', 'ceil'  )
		);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	snapToPixel: function () {
		this.from.snapToPixel();
		this.to.snapToPixel();
		return this;
	},
	/** @returns {string} */
	dump: function (name) {
		return this.parent(name || 'Rectangle');
	},
	/** @returns {LibCanvas.Shapes.Polygon} */
	toPolygon: function () {
		return new Polygon(
			this.from.clone(), this.topRight, this.to.clone(), this.bottomLeft
		);
	},
	/** @returns {string} */
	toString: Function.lambda('[object LibCanvas.Shapes.Rectangle]')
});

/*
---

name: "Shapes.Circle"

description: "Provides circle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Circle

...
*/

var Circle = LibCanvas.Shapes.Circle = Class(
/** @lends {LibCanvas.Shapes.Circle.prototype} */
{
	Extends: Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length >= 3) {
			this.center = new Point(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length == 2) {
			this.center = Point(a[0]);
			this.radius = a[1];
		} else {
			a = a[0];
			this.radius = [a.r, a.radius].pick();
			if ('x' in a && 'y' in a) {
				this.center = new Point(a.x, a.y);
			} else if ('center' in a) {
				this.center = Point(a.center);
			} else if ('from' in a) {
				this.center = new Point(a.from).move({
					x: this.radius,
					y: this.radius
				});
			}
		}
		if (this.center == null) throw new TypeError('center is null');
		if (this.radius == null) throw new TypeError('radius is null');
	},
	// we need accessors to redefine parent "get center"
	get center ( ) { return this._center; },
	set center (c) { this._center = c; },
	grow: function (size) {
		this.radius += size/2;
		return this;
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		return this.center.distanceTo(point) <= this.radius;
	},
	scale : function (factor, pivot) {
		if (pivot) this.center.scale(factor, pivot);
		this.radius *= factor;
		return this;
	},
	getCenter: function () {
		return this.center;
	},
	intersect : function (obj) {
		if (obj instanceof this.self) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		} else {
			return this.getBoundingRectangle().intersect( obj );
		}
	},
	move : function (distance, reverse) {
		distance = this.invertDirection(distance, reverse);
		this.center.move(distance);
		this.fireEvent('move', [distance]);
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		if (this.radius) {
			ctx.arc({
				circle : this,
				angle  : [0, (360).degree()]
			});
		}
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	getBoundingRectangle: function () {
		var shift = new Point( this.radius, this.radius );
		return new Rectangle({
			from: this.center.clone().move( shift, true ),
			to  : this.center.clone().move( shift )
		});
	},
	clone : function () {
		return new this.self(this.center.clone(), this.radius);
	},
	getPoints : function () {
		return { center : this.center };
	},
	equals : function (shape, accuracy) {
		return shape instanceof this.shape &&
			shape.radius == this.radius    &&
			shape.center.equals(this.center, accuracy);
	},
	dump: function () {
		return '[shape Circle(center['+this.center.x+', '+this.center.y+'], '+this.radius+')]';
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Circle]')
});

/*
---

name: "Shapes.Line"

description: "Provides line as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Line

...
*/

var Line = LibCanvas.Shapes.Line = function () {

var between = function (x, a, b, accuracy) {
	return x.equals(a, accuracy) || x.equals(b, accuracy) || (a < x && x < b) || (b < x && x < a);
};

return Class(
/** @lends {LibCanvas.Shapes.Line.prototype} */
{
	Extends: Shape,
	set : function (from, to) {
		var a = Array.pickFrom(arguments);

		if (a.length === 4) {
			this.from = new Point( a[0], a[1] );
			this.to   = new Point( a[2], a[3] );
		} else {
			this.from = Point(a[0] || a.from);
			this.to   = Point(a[1] || a.to);
		}

		return this;
	},
	hasPoint : function (point) {
		var fx = this.from.x,
			fy = this.from.y,
			tx = this.to.x,
			ty = this.to.y,
			px = point.x,
			py = point.y;

		if (!( point.x.between(Math.min(fx, tx), Math.max(fx, tx))
		    && point.y.between(Math.min(fy, ty), Math.max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	intersect: function (line, point, accuracy) {
		if (line.self != this.self) {
			return this.getBoundingRectangle().intersect( line );
		}
		var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
		if (d.x.equals(c.x, accuracy)) { // DC == vertical line
			if (b.x.equals(a.x, accuracy)) {
				if (a.x.equals(d.x, accuracy)) {
					if (a.y.between(c.y, d.y)) {
						return a.clone();
					} else if (b.y.between(c.y, d.y)) {
						return b.clone();
					} else {
						return FALSE;
					}
				} else {
					return FALSE;
				}
			}
			x = d.x;
			y = b.y + (x-b.x)*(a.y-b.y)/(a.x-b.x);
		} else {
			x = ((a.x*b.y - b.x*a.y)*(d.x-c.x)-(c.x*d.y - d.x*c.y)*(b.x-a.x))/((a.y-b.y)*(d.x-c.x)-(c.y-d.y)*(b.x-a.x));
			y = ((c.y-d.y)*x-(c.x*d.y-d.x*c.y))/(d.x-c.x);
			x *= -1;
		}

		if (!between(x, a.x, b.x, accuracy)) return FALSE;
		if (!between(y, a.y, b.y, accuracy)) return FALSE;
		if (!between(x, c.x, d.x, accuracy)) return FALSE;
		if (!between(y, c.y, d.y, accuracy)) return FALSE;

		return point ? new Point(x, y) : true;
	},
	perpendicular: function (point) {
		point = Point( point );
		var
			fX = this.from.x,
			fY = this.from.y,
			tX = this.to.x,
			tY = this.to.y,
			pX = point.x,
			pY = point.y,
			dX = (tX-fX) * (tX-fX),
			dY = (tY-fY) * (tY-fY),
			rX = ((tX-fX)*(tY-fY)*(pY-fY)+fX*dY+pX*dX) / (dX+dY),
			rY = (tY-fY)*(rX-fX)/(tX-fX)+fY;

		return new Point( rX, rY );
	},
	distanceTo: function (p, asInfiniteLine) {
		p = Point(p);
		var f = this.from, t = this.to, degree, s, x, y;
			
		if (!asInfiniteLine) {
			degree = Math.atan2(p.x - t.x, p.y - t.y).getDegree();
			if ( degree.between(-90, 90) ) {
				return t.distanceTo( p );
			}

			degree = Math.atan2(f.x - p.x, f.y - p.y).getDegree();
			if ( degree.between(-90, 90) ) {
				return f.distanceTo( p );
			}
		}

		s = (
			f.x * (t.y - p.y) +
			t.x * (p.y - f.y) +
			p.x * (f.y - t.y)
		).abs() / 2;

		x = f.x - t.x;
		y = f.y - t.y;
		return 2 * s / Math.sqrt(x*x+y*y);
	},
	get length () {
		return this.to.distanceTo(this.from);
	},
	getLength : function () {
		return this.length;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.moveTo(this.from).lineTo(this.to);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	dump: function () {
		return this.parent('Line');
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Line]')
});

}();


}).call(typeof window == 'undefined' ? exports : window, atom, Math);