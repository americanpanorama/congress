var fs = require('fs');
var tjServer = require('topojson-server');

var slivers = require('./raw-data/districtsIntersects.json');

console.log(slivers.features.length);

// var topojson = tjServer.topology(slivers.features);

// console.log(JSON.stringify(topojson));

// var districts = require('./raw-data/districts4.json');

// console.log(slivers.features.length);

// filter through all congresses
// for (var congress = 1; congress <= 115; congress++) {
// 	var aCongressDistricts = districts.features.filter(d => d.properties.startcong <= congress && d.properties.endcong >= congress);
// 	var topojson = tjServer.topology(aCongressDistricts);

// 	fs.writeFile('./districts-topojson/' + congress + '.json', JSON.stringify(topojson), function(err) {
// 		if(err) { return console.log(err); }
// 		console.log("The file was saved!");
// 	});
// }