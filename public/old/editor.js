
LibCanvas.extract();

atom.dom(function () {
	var query = atom.uri().queryKey;
	new Editor({
		container: '#jet-editor',
		width : query.w || 24,
		height: query.h || 16
	});
});