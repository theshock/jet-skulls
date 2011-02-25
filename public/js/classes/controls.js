var Controls = atom.Class({
	initialize: function (field, controls) {
		this.field = field;

		var lc = field.libcanvas
			.listenKeyboard(Object.values(controls))
			.listenMouse(),
		key = lc.getKey.context(lc);

		var shot = false;

		atom(lc.origElem).bind({
			mousedown: function () { shot = true; },
			mouseup  : function () { shot = false; }
		});

		lc.addFunc(function() {
			this.send({
				move : {
					x: key(controls.left) ? -1 : key(controls.right) ? 1 : 0,
					y: key(controls.up)   ? -1 : key(controls.down ) ? 1 : 0
				},
				mouse: lc.mouse.inCanvas ? lc.mouse.point.toObject() : null,
				shot: shot
			});
		}.context(this));
	},
	send: function (data) {
		this.field.link.send({
			unit: data
		});
	}
});