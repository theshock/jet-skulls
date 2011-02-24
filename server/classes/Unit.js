

GLOBAL.Unit = atom.Class({
	speed: 100,
	lastUpdate: 0,
	initialize: function (id, field) {
		this.id         = id;
		this.lastUpdate = Date.now();
		this.position   = new Point(field.randomPoint());
	},
	update: function (status) {

	},
	get object () {
		return {
			id: this.id,
			position : this.position.toObject()
		}
	}
});