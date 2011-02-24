/*
---

name: "LibCanvas"

description: "LibCanvas initialization"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>
	- Anna Shurubey aka Nutochka <iamnutochka@gmail.com>
	- Nikita Baksalyar <nikita@baksalyar.ru>

provides: LibCanvas

...
*/


(function () {

var global = (this.window || GLOBAL);

var LibCanvas = global.LibCanvas = atom.Class({
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
			
			var canvas = atom()
				.create("canvas", {
					width  : width,
					height : height
				}).get();
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		isLibCanvas: function (elem) {
			return elem && elem instanceof LibCanvas.Canvas2D;
		},
		namespace: function (namespace) {
			var current = LibCanvas;
			namespace.split('.').forEach(function(part){
				if (current[part] == null) current[part] = {};
				current = current[part];
			});
			return current;
		},
		extract: function (to) {
			to = to || global;
			
			for (var i in {Shapes: 1, Behaviors: 1, Utils: 1}) {
				for (var k in LibCanvas[i]) {
					to[k] = LibCanvas[i];
				}
			}
			for (i in {Point: 1, Animation: 1}) {
				to[i] = LibCanvas[i];
			}
			return to;
		},

		_invoker: null,
		get invoker () {
			if (this._invoker == null) {
				this._invoker = new LibCanvas.Invoker().invoke();
			}
			return this._invoker;
		}
	},
	initialize: function() {
		return LibCanvas.Canvas2D.factory(arguments);
	}
});

atom(function () {
	LibCanvas.invoker.invoke();
});


})();

/*
---

name: "Geometry"

description: "Base for such things as Point and Shape"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Bindable

provides: Geometry

...
*/

LibCanvas.Geometry = atom.Class({
	Implements: [atom.Class.Events],
	Static: {
		from : function (obj) {
			return (typeof obj == 'object' && obj[0] instanceof this) ? obj[0]
					: (obj instanceof this ? obj : new this(obj));
		}
	},
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	invertDirection: function (distance, reverse) {
		var multi = reverse ? -1 : 1;
		return {
			x : distance.x * multi,
			y : distance.y * multi
		};
	},
	move : function (distance, reverse) {
		this.fireEvent('move', [this.invertDirection(distance, reverse)]);
		return this;
	}
});

/*
---

name: "Utils.Math"

description: "Helpers for basic math operations, such as degree, hypotenuse from two cathetus, etc"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Utils.Math

...
*/

// Number
new function () {


var degreesCache = {};

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

for (var degree in [0, 45, 90, 135, 180, 225, 270, 315, 360].toKeys()) {
	degreesCache[degree] = (degree * 1).degree();
}
var d360 = degreesCache[360];

};

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

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Utils.Math

provides: Point

...
*/

new function (undefined) {

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

var Point = LibCanvas.Point = atom.Class({
	Extends: LibCanvas.Geometry,
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
		this.x = x == null ? x : Number(x);
		this.y = y == null ? y : Number(y);
		return this;
	},
	move: function (distance, reverse) {
		distance = this.self.from(distance);
		distance = this.invertDirection(distance, reverse);
		this.x += distance.x;
		this.y += distance.y;

		return this.parent(distance, false);
	},
	moveTo : function (newCoord, speed) {
		return speed ?
			this.animateMoveTo(newCoord, speed) :
			this.move(this.diff(newCoord));
	},
	angleTo : function (point) {
		var diff = Point.from(arguments).diff(this);
		return Math.atan2(diff.y, diff.x).normalizeAngle();
	},
	distanceTo : function (point) {
		var diff = Point.from(arguments).diff(this);
		return Math.hypotenuse(diff.x, diff.y);
	},
	diff : function (point) {
		return Point.from(arguments)
			.clone().move(this, true);
	},
	rotate : function (angle, pivot) {
		pivot = Point.from(pivot || {x: 0, y: 0});
		if (this.equals(pivot)) return this;
		
		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	scale : function (power, pivot) {
		pivot = Point.from(pivot || {x: 0, y: 0});
		var diff = this.diff(pivot), isObject = typeof power == 'object';
		return this.moveTo({
			x : pivot.x - diff.x  * (isObject ? power.x : power),
			y : pivot.y - diff.y  * (isObject ? power.y : power)
		});
	},
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	getNeighbour : function (dir) {
		return this.clone().move(shifts[dir]);
	},
	movingInterval: 0,
	animateMoveTo : function (to, speed) {
		this.movingInterval.stop();
		this.movingInterval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.diff(to);
			var dist = this.distanceTo(to);
			if (dist > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / dist);
				move.y = diff.y * (pixelsPerFn / dist);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				this.movingInterval.stop();
				this.fireEvent('stopMove');
			}
			this.move(move);
		}.periodical(20, this);
		return this;
	},
	equals : function (to, accuracy) {
		to = Point.from(to);
		return accuracy == null ? (to.x == this.x && to.y == this.y) :
			(this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy));
	},
	snapToPixel: function (minus) {
		var shift = minus ? -0.5 : 0.5;
		return this.clone().move({ x: shift, y: shift });
	},
	toObject: function () {
		return {
			x: this.x,
			y: this.y
		};
	},
	clone : function () {
		return new Point(this);
	}
});

};
 
