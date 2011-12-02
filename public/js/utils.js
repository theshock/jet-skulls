Jet.Utils = {
	/** @returns {string} */
	dateDebug: function () {
		var date = new Date(), pad = Jet.Utils.padLeft;
		return pad(date.getHours()       , '0', 2) + ':'
		    +  pad(date.getMinutes()     , '0', 2) + ':'
		    +  pad(date.getSeconds()     , '0', 2) + '.'
		    +  pad(date.getMilliseconds(), '0', 3);
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