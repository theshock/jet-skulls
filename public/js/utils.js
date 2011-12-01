Jet.Utils = {
	/** @returns {string} */
	dateDebug: function () {
		var date = new Date();
		return date.getHours()   + ':'
		    +  date.getMinutes() + ':'
		    + Jet.Utils.padLeft(date.getSeconds()     , '0', 2) + '.'
		    + Jet.Utils.padLeft(date.getMilliseconds(), '0', 3);
	},

	padLeft: function (value, str, length) {
		value = String(value);
		while (value.length < length) value = str + value;
		return value;
	},

	padRight: function (value, str, length) {
		value = String(value);
		while (value.length < length) value += str;
		return value;
	}
};