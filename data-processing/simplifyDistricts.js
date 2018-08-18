// currently this doesn't simplify but just takes a file (already simplified) with all districts and splits those into individual geojson files for each congress

var fs = require('fs');
//var tjServer = require('topojson-server');

var districts = require('./raw-data/districts6.json');

// filter through all congresses
for (var congress = 1; congress <= 115; congress++) {
	var aCongressDistricts = districts.features.filter(d => d.properties.startcong <= congress && d.properties.endcong >= congress);
	//var topojson = tjServer.topology(aCongressDistricts);
	var geojson = {
		type: 'FeatureCollection',
		features: aCongressDistricts
	};
	var filepath = './districts-geojson/' + congress + '.json';

	fs.writeFile(filepath, JSON.stringify(geojson), function(err) {
		if(err) { return console.log(err); }
		console.log("saved: " + filepath);
	});
}


