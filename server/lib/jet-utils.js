
/**
 * Возвращает список свойств, которые изменились
 * в объекте next по сравнению с current
 * @param {Object} current
 * @param {Object} next
 * @returns {Object}
 */
exports.objectDiff = function (current, next) {
	var diff = {};
	for (var i in next) {
		if (current[i] != next[i]) {
			diff[i] = next[i];
		}
	}
	return diff;
};