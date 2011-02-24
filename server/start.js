require.paths.unshift(__dirname + '/lib');

require('atom');
require('libcanvas');

require('./classes/Link');

var link = new Link(require('./http').server(6660));

link.addEvent('connect')

