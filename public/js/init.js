
/** @namespace Jet */
window.Jet = {};
window.Class = atom.Class;
LibCanvas.extract();
atom.dom(function () {
	new Jet.Controller();
});