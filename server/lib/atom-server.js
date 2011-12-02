
/*
---

name: "AtomJS"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

inspiration:
	- "[JQuery](http://jquery.com)"
	- "[MooTools](http://mootools.net)"

...
*/

(function (Object, Array, undefined) { // AtomJS
'use strict';
	
/*
---

name: "Core"

description: "The core of AtomJS."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

inspiration:
  - "[JQuery](http://jquery.com)"
  - "[MooTools](http://mootools.net)"

provides: atom

...
*/

var
	prototype = 'prototype',
	apply     = 'apply',
	toString  = Object[prototype].toString,
	slice     = [].slice;

var atom = this.atom = function () {
	if (atom.initialize) return atom.initialize[apply](this, arguments);
};

atom.global = this;

var innerExtend = function (proto) {
	return function (elem, from) {
		if (from == null) {
			from = elem;
			elem = atom;
		}

		var ext = proto ? elem[prototype] : elem,
		    accessors = atom.accessors && atom.accessors.inherit;

		for (var i in from) if (i != 'constructor') {
			if ( accessors && accessors(from, ext, i) ) continue;

			ext[i] = clone(from[i]);
		}
		return elem;
	};
};

var typeOf = function (item) {
	if (item == null) return 'null';

	var string = toString.call(item);
	for (var i in typeOf.types) if (i == string) return typeOf.types[i];

	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return /\S/.test(item.nodeValue) ? 'textnode' : 'whitespace';
	}

	var type = typeof item;

	if (item && type == 'object') {
		if (atom.Class && item instanceof atom.Class) return 'class';
		if (atom.isEnumerable(item)) return 'arguments';
	}

	return type;
};
typeOf.types = {};
['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Class'].forEach(function(name) {
	typeOf.types['[object ' + name + ']'] = name.toLowerCase();
});


var clone = function (object) {
	var type = typeOf(object);
	return type in clone.types ? clone.types[type](object) : object;
};
clone.types = {
	array: function (array) {
		var i = array.length, c = new Array(i);
		while (i--) c[i] = clone(array[i]);
		return c;
	},
	object: function (object) {
		if (typeof object.clone == 'function') return object.clone();

		var c = {}, accessors = atom.accessors && atom.accessors.inherit;
		for (var key in object) {
			if (accessors && accessors(object, c, key)) continue;
			c[key] = clone(object[key]);
		}
		return c;
	}
};

atom.extend = innerExtend(false);

atom.extend({
	implement: innerExtend(true),
	toArray: function (elem) {
		return slice.call(elem);
	},
	/**
	 * @deprecated - use console-cap instead:
	 * @see https://github.com/theshock/console-cap/
	 */
	log: function () {
		// ie9 bug, typeof console.log == 'object'
		if (atom.global.console) Function.prototype.apply.call(console.log, console, arguments);
	},
	isEnumerable: function(item){
		return item != null && toString.call(item) != '[object Function]' && typeof item.length == 'number';
	},
	append: function (target, source) {
		for (var i = 1, l = arguments.length; i < l; i++){
			source = arguments[i] || {};
			for (var key in source) {
				target[key] = source[key];
			}
		}
		return target;
	},
	typeOf: typeOf,
	clone: clone
});

// JavaScript 1.8.5 Compatiblity
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind

if (!Function.prototype.bind) {
	Function.prototype.bind = function(context /*, arg1, arg2... */) {
		if (typeof this !== "function") throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");

		var args   = slice.call(arguments, 1),
			toBind = this,
			Nop    = function () {},
			Bound  = function () {
				var isInstance;
				// Opera & Safari bug fixed. I must fix it in right way
				// TypeError: Second argument to 'instanceof' does not implement [[HasInstance]]
				try {
					isInstance = this instanceof Nop;
				} catch (ignored) {
					// console.log( 'bind error', Nop.prototype );
					isInstance = false;
				}
				return toBind.apply(
					isInstance ? this : ( context || {} ),
					args.concat( slice.call(arguments) )
				);
			};
		Nop.prototype   = toBind.prototype;
		Bound.prototype = new Nop();
		return Bound;
	};
}

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = function(obj) {
		if (obj !== Object(obj)) throw new TypeError('Object.keys called on non-object');

		var keys = [], i, has = Object[prototype].hasOwnProperty;
		for (i in obj) if (has.call(obj, i)) keys.push(i);
		return keys;
	};
}

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
	Array.isArray = function(o) {
		return o && toString.call(o) === '[object Array]';
	};
}

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
	Object.create = function (o) {
		if (arguments.length > 1) {
			throw new Error('Object.create implementation only accepts the first parameter.');
		}
		function F() {}
		F.prototype = o;
		return new F();
	};
}

/*
---

name: "Number"

description: "Contains Number Prototypes like limit, round, times, and ceil."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: Number

...
*/

new function () {
	
atom.extend(Number, {
	random : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
});

atom.implement(Number, {
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L' && this == n1) ||
			(equals == 'R' && this == n2) ||
			(  this  > n1  && this  < n2) ||
			([true,'LR','RL'].indexOf(equals) != -1 && (n1 == this || n2 == this))
		);
	},
	equals : function (to, accuracy) {
		if (accuracy == null) accuracy = 8;
		return this.toFixed(accuracy) == to.toFixed(accuracy);
	},
	limit: function(min, max){
		var bottom = Math.max(min, this);
		return arguments.length == 2 ?
			Math.min(max, bottom) : bottom;
	},
	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},
	toFloat: function(){
		return parseFloat(this);
	},
	toInt: function(base){
		return parseInt(this, base || 10);
	},
	stop: function() {
		var num = Number(this);
		if (num) {
			clearInterval(num);
			clearTimeout (num);
		}
		return this;
	},
	xor: function (x) {
		return Boolean.xor( this.valueOf(), x );
	}
});

['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','sin','sqrt','tan']
	.forEach(function(method) {
		if (Number[method]) return;
		
		Number.prototype[method] = function() {
			return Math[method].apply(null, [this].append(arguments));
		};
	});

};

/*
---

name: "Array"

description: "Contains Array Prototypes like include, contains, and erase."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Number

provides: Array

...
*/

new function (undefined) {
var slice = [].slice;

atom.extend(Array, {
	range: function (from, to, step) {
		step = (step * 1).limit(0) || 1;
		var result = [];
		do {
			result.push(from);
			from += step;
		} while (from <= to);
		return result;
	},
	from: function (item) {
		if (item == null) return [];
		return (!atom.isEnumerable(item) || typeof item == 'string') ? [item] :
			(atom.typeOf(item) == 'array') ? item : slice.call(item);
	},
	pickFrom: function (args) {
		return Array.from(
			   args
			&& args.length == 1
			&& ['array', 'arguments'].contains(atom.typeOf(args[0])) ?
				args[0] : args
		);
	},
	fill: function (array, fill) {
		array = Array.isArray(array) ? array : new Array(array * 1);
		for (var i = array.length; i--;) array[i] = fill;
		return array;
	},
	fillMatrix: function (width, height, fill) {
		var array = new Array(height);
		while (height--) {
			array[height] = Array.fill(width, fill);
		}
		return array;
	},
	collect: function (obj, props, Default) {
		var array = [];
		for (var i = 0, l = props.length; i < l; i++) {
			array.push(props[i] in obj ? obj[props[i]] : Default);
		}
		return array;
	},
	create: function (length, fn) {
		var array = new Array(length);
		for (var i = 0; i < length; i++) array[i] = fn(i, array);
		return array;
	},
	toHash: function () {
		for (var hash = {}, i = 0, l = this.length; i < l; i++) hash[i] = this[i];
		return hash;
	}
});

atom.implement(Array, {
	get last(){
		return this.length ? this[this.length - 1] : null;
	},
	get random(){
		return this.length ? this[Number.random(0, this.length - 1)] : null;
	},
	popRandom: function () {
		if (this.length == 0) return null;
		var index = Number.random(0, this.length - 1), elem = this[index];
		this.splice(index, 1);
		return elem;
	},
	property: function (prop) {
		return this.map(function (elem) {
			return elem != null ? elem[ prop ] : null;
		});
	},
	// Correctly works with `new Array(10).fullMap(fn)`
	fullMap: function (fn, bind) {
		var mapped = new Array(this.length);
		for (var i = 0, l = mapped.length; i < l; i++) {
			mapped[i] = fn.call(bind, this[i], i, this);
		}
		return mapped;
	},
	contains: function (elem, fromIndex) {
		return this.indexOf(elem, fromIndex) != -1;
	},
	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},
	append: function (array) {
		for (var i = 0, l = arguments.length; i < l; i++) if (arguments[i]) {
			this.push.apply(this, arguments[i]);
		}
		return this;
	},
	erase: function(item){
		for (var i = this.length; i--;) {
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},
	toKeys: function (value) {
		var useValue = arguments.length == 1, obj = {};
		for (var i = 0, l = this.length; i < l; i++)
			obj[this[i]] = useValue ? value : i;
		return obj;
	},
	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++) {
			if (this[i] != null) return this[i];
		}
		return null;
	},
	invoke: function(context){
		var args = slice.call(arguments, 1);
		if (typeof context == 'string') {
			var methodName = context;
			context = null;
		}
		return this.map(function(item){
			return item && (methodName ? item[methodName] : item).apply(methodName ? item : context, args);
		});
	},
	shuffle : function () {
		for (var tmp, moveTo, index = this.length; index--;) {
			moveTo = Number.random( 0, index );
			// [ this[index], this[moveTo] ] = [ this[moveTo], this[index] ]
			tmp          = this[index ];
			this[index]  = this[moveTo];
			this[moveTo] = tmp;
		}
		return this;
	},
	sortBy : function (method, reverse) {
		var get = function (elem) {
			return typeof elem[method] == 'function' ? elem[method]() : (elem[method] || 0);
		};
		var multi = reverse ? -1 : 1;
		return this.sort(function ($0, $1) {
			var diff = get($1) - get($0);
			return diff ? (diff < 0 ? -1 : 1) * multi : 0;
		});
	},
	min: function(){
		return Math.min.apply(null, this);
	},
	max: function(){
		return Math.max.apply(null, this);
	},
	mul: function (factor) {
		for (var i = this.length; i--;) this[i] *= factor;
		return this;
	},
	add: function (number) {
		for (var i = this.length; i--;) this[i] += number;
		return this;
	},
	average: function(){
		return this.length ? this.sum() / this.length : 0;
	},
	sum: function(){
		for (var result = 0, i = this.length; i--;) result += this[i];
		return result;
	},
	unique: function(){
		return [].combine(this);
	},
	associate: function(keys){
		var obj = {}, length = this.length, i, isFn = atom.typeOf(keys) == 'function';
		if (!isFn) length = Math.min(length, keys.length);
		for (i = 0; i < length; i++) {
			obj[(isFn ? this : keys)[i]] = isFn ? keys(this[i], i) : this[i];
		}
		return obj;
	},
	clean: function (){
		return this.filter(function (item) { return item != null; });
	},
	empty: function () {
		this.length = 0;
		return this;
	},
	clone: function () {
		return atom.clone(this);
	},
	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return parseInt(value, 16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},
	rgbToHex: function(array) {
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	},

	reduce: [].reduce || function(fn, value){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) value = value === undefined ? this[i] : fn.call(null, value, this[i], i, this);
		}
		return value;
	},

	reduceRight: [].reduceRight || function(fn, value){
		for (var i = this.length; i--;){
			if (i in this) value = value === undefined ? this[i] : fn.call(null, value, this[i], i, this);
		}
		return value;
	}
});

};

/*
---

name: "Function"

description: "Contains Function Prototypes like context, periodical and delay."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Array

provides: Function

...
*/

new function () {

	var getContext = function (bind, self) {
		return (bind === false || bind === Function.context) ? self : bind;
	};

	var slice = [].slice;

	atom.extend(Function, {
		lambda : function (value) {
			var returnThis = (arguments.length == 0);
			return function () { return returnThis ? this : value; };
		},
		copier: function (value) {
			return function () { return atom.clone(value); }
		},
		log: function (msg) {
			var args = arguments.length ? arguments : null;
			return function () {
				atom.log.apply(atom, args || [this]);
			};
		},
		// for pointing at "this" context in "context" method
		context: {}
	});

	atom.implement(Function, {
		/** @deprecated */
		context: function(bind, args){
			var fn = this;
			args = Array.from(args);
			return function(){
				return fn.apply(getContext(bind, this), [].append(args, arguments));
			};
		},
		only: function(numberOfArgs, bind) {
			var fn = this;
			return function() {
				return fn.apply(getContext(bind, this), slice.call(arguments, 0, numberOfArgs))
			};
		},
		after: function (fnName) {
			var onReady = this, after = {}, ready = {};
			var checkReady = function () {
				for (var i in after) if (!(i in ready)) return;
				onReady(ready);
			};
			for (var i = 0, l = arguments.length; i < l; i++) {
				(function (key) {
					after[key] = function () {
						ready[key] = arguments;
						checkReady();
					};
				})(arguments[i]);
			}
			return after;
		}
	});

	var timeout = function (name) {
		var set = {
			Timeout : setTimeout,
			Interval: setInterval
		}[name];

		return function (time, bind, args) {
			return set.call(null, this.bind.apply(this, [bind].append(args)), time);
		};
	};
	
	atom.implement(Function, {
		delay:      timeout('Timeout'),
		periodical: timeout('Interval')
	});
}(); 


/*
---

name: "Object"

description: "Object generic methods"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: Object

...
*/

atom.extend(Object, {
	invert: function (object) {
		var newObj = {};
		for (var i in object) newObj[object[i]] = i;
		return newObj;
	},
	collect: function (obj, props, Default) {
		var newObj = {};
		for (var i in props.toKeys()) {
			newObj[i] = i in obj ? obj[i] : Default;
		}
		return newObj;
	},
	keys: function (obj) {
		var keys = [];
		for (var i in obj) keys.push(i);
		return keys;
	},
	values: function (obj) {
		var values = [];
		for (var i in obj) values.push(obj[i]);
		return values;
	},
	isDefined: function (obj) {
		return typeof obj != 'undefined';
	},
	isReal: function (obj) {
		return obj || obj === 0;
	},
	map: function (obj, fn) {
		var mapped = {};
		for (var i in obj) if (obj.hasOwnProperty(i)) {
			mapped[i] = fn( obj[i], i, obj );
		}
		return mapped;
	},
	max: function (obj) {
		var max = null, key = null;
		for (var i in obj) if (max == null || obj[i] > max) {
			key = i;
			max = obj[i];
		}
		return key;
	},
	min: function (obj) {
		var min = null, key = null;
		for (var i in obj) if (min == null || obj[i] < min) {
			key = i;
			min = obj[i];
		}
		return key;
	},
	deepEquals: function (first, second) {
		if (!first || (typeof first) !== (typeof second)) return false;

		for (var i in first) {
			var f = first[i], s = second[i];
			if (typeof f === 'object') {
				if (!s || !Object.deepEquals(f, s)) return false;
			} else if (f !== s) {
				return false;
			}
		}

		for (i in second) if (!(i in first)) return false;

		return true;
	},
	ifEmpty: function (object, key, defaultValue) {
		if (!(key in object)) {
			object[key] = defaultValue;
		}
		return object;
	},
	path: {
		parts: function (path, delimiter) {
			return Array.isArray(path) ? path : String(path).split( delimiter || '.' );
		},
		get: function (object, path, delimiter) {
			if (!path) return object;

			path = Object.path.parts( path, delimiter );

			for (var i = 0; i < path.length; i++) {
				if (object != null && path[i] in object) {
					object = object[path[i]];
				} else {
					return;
				}
			}

			return object;
		},
		set: function (object, path, value, delimiter) {
			path = Object.path.parts( path, delimiter );

			var key = path.pop();

			object = Object.path.get( object, path.length > 0 && path, delimiter );

			if (object == null) {
				return false;
			} else {
				object[key] = value;
				return true;
			}
		}
	}
});

/*
---

name: "String"

description: "Contains String Prototypes like repeat, substitute, replaceAll and begins."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: String

...
*/

new function () {

var substituteRE = /\\?\{([^{}]+)\}/g,
	safeHtmlRE = /[<'&">]/g,
	UID = Date.now();

String.uniqueID = function () {
	return (UID++).toString(36);
};

atom.implement(String, {
	safeHtml: function () {
		return this.replaceAll(safeHtmlRE, {
			'&'  : '&amp;',
			'\'' : '&#039;',
			'\"' : '&quot;',
			'<'  : '&lt;',
			'>'  : '&gt;'
		});
	},
	repeat: function(times) {
		return new Array(times + 1).join(this);
	},
	substitute: function(object, regexp){
		return this.replace(regexp || substituteRE, function(match, name){
			return (match[0] == '\\') ? match.slice(1) : (object[name] == null ? '' : object[name]);
		});
	},
	replaceAll: function (find, replace) {
		var type = atom.typeOf(find);
		if (type == 'regexp') {
			return this.replace(find, function (symb) { return replace[symb]; });
		} else if (type == 'object') {
			var result = this;
			for (var i in find) result = result.replaceAll(i, find[i]);
			return result;
		}
		return this.split(find).join(replace);
	},
	contains: function (substr) {
		return this.indexOf( substr ) >= 0;
	},
	begins: function (w, caseInsensitive) {
		return (!caseInsensitive) ? w == this.substr(0, w.length) :
			w.toLowerCase() == this.substr(0, w.length).toLowerCase();
	},
	ends: function (w, caseInsensitive) {
		return (!caseInsensitive) ? w == this.substr(this.length - w.length) :
			w.toLowerCase() == this.substr(this.length - w.length).toLowerCase();
	},
	ucfirst : function () {
		return this[0].toUpperCase() + this.substr(1);
	},
	lcfirst : function () {
		return this[0].toLowerCase() + this.substr(1);
	},
	trim: ''.trim || function () {
		return this.trimLeft().trimRight();
	},
	trimLeft : ''.trimLeft || function () {
		return this.replace(/^\s+/, '');
	},
	trimRight: ''.trimRight || function () {
		return this.replace(/\s+$/, '');
	}
});

}();

/*
---

name: "Accessors"

description: "Implementing accessors"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom

provides: accessors

...
*/

(function (Object) {
	var standard = !!Object.getOwnPropertyDescriptor, nonStandard = !!{}.__defineGetter__;

	if (!standard && !nonStandard) throw new Error('Accessors are not supported');

	var lookup = nonStandard ?
		function (from, key, bool) {
			var g = from.__lookupGetter__(key), s = from.__lookupSetter__(key), has = !!(g || s);

			if (bool) return has;

			return has ? { get: g, set: s } : null;
		} :
		function (from, key, bool) {
			var descriptor = Object.getOwnPropertyDescriptor(from, key);
			if (!descriptor) {
				// try to find accessors according to chain of prototypes
				var proto = Object.getPrototypeOf(from);
				if (proto) return accessors.lookup(proto, key, bool);
			} else if ( descriptor.set || descriptor.get ) {
				if (bool) return true;

				return {
					set: descriptor.set,
					get: descriptor.get
				};
			}
			return bool ? false : null;
		}; /* lookup */

	var define = nonStandard ?
		function (object, prop, descriptor) {
			if (descriptor) {
				if (descriptor.get) object.__defineGetter__(prop, descriptor.get);
				if (descriptor.set) object.__defineSetter__(prop, descriptor.set);
			}
			return object;
		} :
		function (object, prop, descriptor) {
			if (descriptor) {
				var desc = {
					get: descriptor.get,
					set: descriptor.set,
					configurable: true,
					enumerable: true
				};
				Object.defineProperty(object, prop, desc);
			}
			return object;
		};

	var accessors = {
		lookup: lookup,
		define: define,
		has: function (object, key) {
			return accessors.lookup(object, key, true);
		},
		inherit: function (from, to, key) {
			var a = accessors.lookup(from, key);

			if ( a ) {
				accessors.define(to, key, a);
				return true;
			}
			return false;
		}
	};

	atom.extend({ accessors: accessors });
})(Object);

/*
---

name: "Class"

description: "Contains the Class Function for easily creating, extending, and implementing reusable Classes."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- accessors
	- Array

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class

...
*/


(function(atom){

var typeOf = atom.typeOf,
	extend = atom.extend,
	accessors = atom.accessors.inherit,
	prototype = 'prototype',
	lambda    = function (value) { return function () { return value; }},
	prototyping = false;

var Class = function (params) {
	if (prototyping) return this;

	if (typeof params == 'function' && typeOf(params) == 'function') params = { initialize: params };

	var Constructor = function(){
		if (this instanceof Constructor) {
			if (prototyping) return this;
			return this.initialize ? this.initialize.apply(this, arguments) : this;
		} else {
			return Constructor.invoke.apply(Constructor, arguments);
		}
	};
	extend(Constructor, Class);
	Constructor[prototype] = getInstance(Class);

	Constructor
		.implement(params, false)
		.reserved(true, {
			parent: parent,
			self  : Constructor
		})
		.reserved({
			factory : function() {
				function Factory(args) { return Constructor.apply(this, args); }
				Factory[prototype] = Constructor[prototype];
				return function(args) { return new Factory(args || []); }
			}()
		});

	return Constructor;
};

var parent = function(){
	if (!this.$caller) throw new Error('The method «parent» cannot be called.');
	var name     = this.$caller.$name,
		parent   = this.$caller.$owner.parent,
		previous = parent && parent[prototype][name];
	if (!previous) throw new Error('The method «' + name + '» has no parent.');
	return previous.apply(this, arguments);
};

var wrap = function(self, key, method){
	// if method is already wrapped
	if (method.$origin) method = method.$origin;
	
	var wrapper = function() {
		if (method.$protected && !this.$caller) throw new Error('The method «' + key + '» is protected.');
		var current = this.$caller;
		this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current;
		return result;
	};
	wrapper.$owner  = self;
	wrapper.$origin = method;
	wrapper.$name   = key;
	
	return wrapper;
};

var getInstance = function(Class){
	prototyping = true;
	var proto = new Class;
	prototyping = false;
	return proto;
};

Class.extend =  function (name, fn) {
	if (typeof name == 'string') {
		var object = {};
		object[name] = fn;
	} else {
		object = name;
	}

	for (var i in object) if (!accessors(object, this, i)) {
		 this[i] = object[i];
	}
	return this;
};

Class.extend({
	implement: function(name, fn, retain){
		if (typeof name == 'string') {
			var params = {};
			params[name] = fn;
		} else {
			params = name;
			retain = fn;
		}

		for (var key in params) {
			if (!accessors(params, this[prototype], key)) {
				var value = params[key];

				if (Class.Mutators.hasOwnProperty(key)){
					value = Class.Mutators[key].call(this, value);
					if (value == null) continue;
				}

				if (typeof value == 'function' && typeOf(value) == 'function'){
					if (value.$origin) value = value.$origin;
					if (value.$hidden == 'next') {
						value.$hidden = true
					} else if (value.$hidden) {
						continue;
					}
					this[prototype][key] = (retain) ? value : wrap(this, key, value);
				} else {
					this[prototype][key] = atom.clone(value);
				}
			}
		}
		return this;
	},
	mixin: function () {
		Array.from(arguments).forEach(function (item) {
			this.implement(getInstance(item));
		}.bind(this));
		return this;
	},
	reserved: function (toProto, props) { // use careful !!
		if (arguments.length == 1) {
			props = toProto;
			toProto = false;
		}
		var target = toProto ? this[prototype] : this;
		for (var name in props) {
			atom.accessors.define(target, name, { get: lambda(props[name]) });
		}
		return this;
	},
	isInstance: function (object) {
		return object instanceof this;
	},
	invoke: function () {
		return this.factory( arguments );
	},
	Mutators: {
		Extends: function(parent){
			if (parent == null) throw new TypeError('Cant extends from null');
			this.extend(parent).reserved({ parent: parent });
			this[prototype] = getInstance(parent);
		},

		Implements: function(items){
			this.mixin.apply(this, Array.from(items));
		},

		Static: function(properties) {
			this.extend(properties);
		}
	},
	abstractMethod: function () {
		throw new Error('Abstract Method «' + this.$caller.$name + '» called');
	},
	protectedMethod: function (fn) {
		return extend(fn, { $protected: true });
	},
	hiddenMethod: function (fn) {
		return extend(fn, { $hidden: 'next' });
	}
});

Class.abstractMethod.$abstract = true;

extend({ Class: Class });

})(atom);

/*
---

name: "Class.Events"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Class

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class.Events

...
*/

new function () {

var Class = atom.Class;

var fire = function (name, fn, args, onfinish) {
	var result = fn.apply(this, Array.from(args || []));
	if (typeof result == 'string' && result.toLowerCase() == 'removeevent') {
		onfinish.push(this.removeEvent.bind(this, name, fn));
	}
};

var removeOn = function(string){
	return (string || '').replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

var initEvents = function (object, reset) {
	if (reset || !object._events) object._events = { $ready: {} };
};

var nextTick = function (fn) {
	nextTick.fn.push(fn);
	if (!nextTick.id) {
		nextTick.id = function () {
			nextTick.reset().invoke();
		}.delay(1);
	}
};
nextTick.reset = function () {
	var fn = nextTick.fn;
	nextTick.fn = [];
	nextTick.id = 0;
	return fn;
};
nextTick.reset();

atom.extend(Class, {
	Events: Class({
		addEvent: function(name, fn) {
			initEvents(this);

			var i, l, onfinish = [];
			if (arguments.length == 1 && typeof name != 'string') {
				for (i in name) {
					this.addEvent(i, name[i]);
				}
			} else if (Array.isArray(name)) {
				for (i = 0, l = name.length; i < l; i++) {
					this.addEvent(name[i], fn);
				}
			} else {
				name = removeOn(name);
				if (name == '$ready') {
					throw new TypeError('Event name «$ready» is reserved');
				} else if (!fn) {
					throw new TypeError('Function is empty');
				} else {
					Object.ifEmpty(this._events, name, []);

					this._events[name].include(fn);

					var ready = this._events.$ready[name];
					if (ready) fire.apply(this, [name, fn, ready, onfinish]);
					onfinish.invoke();
				}
			}
			return this;
		},
		removeEvent: function (name, fn) {
			if (!arguments.length) {
				initEvents( this, true );
				return this;
			}

			initEvents(this);

			if (Array.isArray(name)) {
				for (var i = name.length; i--;) {
					this.removeEvent(name[i], fn);
				}
			} else if (arguments.length == 1 && typeof name != 'string') {
				for (i in name) {
					this.removeEvent(i, name[i]);
				}
			} else {
				name = removeOn(name);
				if (name == '$ready') {
					throw new TypeError('Event name «$ready» is reserved');
				} else if (arguments.length == 1) {
					this._events[name] = [];
				} else if (name in this._events) {
					this._events[name].erase(fn);
				}
			}
			return this;
		},
		isEventAdded: function (name) {
			initEvents(this);
			
			var e = this._events[name];
			return !!(e && e.length);
		},
		fireEvent: function (name, args) {
			initEvents(this);
			
			name = removeOn(name);
			var funcs = this._events[name];
			if (funcs) {
				var onfinish = [],
					l = funcs.length,
					i = 0;
				for (;i < l; i++) fire.call(this, name, funcs[i], args || [], onfinish);
				onfinish.invoke();
			}
			return this;
		},
		readyEvent: function (name, args) {
			initEvents(this);
			
			nextTick(function () {
				name = removeOn(name);
				this._events.$ready[name] = args || [];
				this.fireEvent(name, args || []);
			}.bind(this));
			return this;
		}
	})
});

};

/*
---

name: "Class.Options"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- atom
	- Class

inspiration:
  - "[MooTools](http://mootools.net)"

provides: Class.Options

...
*/

atom.Class.Options = atom.Class({
	options: {},
	setOptions: function(){
		if (!this.options) {
			this.options = {};
		} else if (this.options == this.self.prototype.options) {
			// it shouldn't be link to static options
			this.options = atom.clone(this.options);
		}

		for (var a = arguments, i = 0, l = a.length; i < l; i++) {
			if (typeof a[i] == 'object') atom.extend(this.options, a[i]);
		}
		var options = this.options;
		
		if (this.addEvent) for (var option in options){
			if (atom.typeOf(options[option]) == 'function' && (/^on[A-Z]/).test(option)) {
				this.addEvent(option, options[option]);
				delete options[option];
			}
		}
		return this;
	}
});

/*
---

name: "Class.Mutators.Generators"

description: "Provides Generators mutator"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- atom
	- accessors
	- Class

provides: Class.Mutators.Generators

...
*/

new function () {

var getter = function (key, fn) {
	return function() {
		var pr = '_' + key, obj = this;
		return pr in obj ? obj[pr] : (obj[pr] = fn.call(obj));
	};
};

atom.Class.Mutators.Generators = function(properties) {
	for (var i in properties) atom.accessors.define(this.prototype, i, { get: getter(i, properties[i]) });
};

};

}.call(typeof exports == 'undefined' ? window : exports, Object, Array)); 
