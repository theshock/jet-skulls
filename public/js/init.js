
LibCanvas.extract();

atom(function () {
	
	var field = new Field({
		element : '#jet',
		server  : { port: 6660 }
	});

	field.controls = new Controls(field, {
		up   : 'w',
		down : 's',
		left : 'a',
		right: 'd'
	});

});