
LibCanvas.extract();

atom(function () {
	
	var field = new Field({
		element: '#jet',
		screen : { width: 800, height: 500 },
		server : { port: 6660 }
	});

	field.controls = new Controls(field, {
		up   : 'w',
		down : 's',
		left : 'a',
		right: 'd'
	});

});