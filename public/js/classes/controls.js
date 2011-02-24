var Controls = atom.Class({
	initialize: function (jet, controls) {
		this.jet = jet;

		var lc = jet.libcanvas.listenKeyboard(
			Object.values(controls)
		),
		key = lc.getKey.context(lc);
		lc.addFunc(function() {
			var move = {
				x: key(controls.left) ? -1 : key(controls.right) ? 1 : 0,
				y: key(controls.up)   ? -1 : key(controls.down ) ? 1 : 0
			};
			if (move.x || move.y) this.send({ move: move });
		}.context(this));
	},
	send: function (data) {
		this.jet.link.send({
			unit: data
		});
	}
});