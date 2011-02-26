require.paths.unshift(__dirname + '/lib');

require('atom-server');
require('libcanvas-server');

require('./classes/Unit');
require('./classes/Field');
require('./classes/Link');
require('./classes/Barrier');

LibCanvas.extract();

new function () {
	var field = new Field(1200, 750)
		.createBarriers([
			[100, 100, 200, 200],
			[100, 400, 200, 350],
			[400, 100, 100, 390],
			[400, 500, 400, 100],
			[700, 100, 300, 200]
		]);

	require('socket.io').listen(
		require('./http').server(6660)
	).on('connection',
		field.createLink.context(field)
	);
};