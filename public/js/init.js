
LibCanvas.extract();

atom(function () {
	var jet = new Jet({
		element : '#jet',
		server  : 6660
	});

	new Controls(jet, {
		up   : 'w',
		down : 's',
		left : 'a',
		right: 'd'
	});

});