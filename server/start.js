require.paths.unshift(__dirname + '/lib');

require('atom');
require('libcanvas');

require('./classes/Unit');
require('./classes/Field');
require('./classes/Link');

LibCanvas.extract();

new function () {
	var field = new Field(800, 500);

	require('socket.io').listen(
		require('./http').server(6660)
	).on('connection',
		field.createLink.context(field)
	);
};