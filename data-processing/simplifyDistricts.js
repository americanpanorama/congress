var fs = require('fs');
var tjServer = require('topojson-server');

var districts = require('./raw-data/districts4.json');

// filter through all congresses
for (var congress = 1; congress <= 115; congress++) {
	var aCongressDistricts = districts.features.filter(d => d.properties.startcong <= congress && d.properties.endcong >= congress);
	var topojson = tjServer.topology(aCongressDistricts);

	fs.writeFile('./districts-topojson/' + congress + '.json', JSON.stringify(topojson), function(err) {
		if(err) { return console.log(err); }
		console.log("The file was saved!");
	});
}