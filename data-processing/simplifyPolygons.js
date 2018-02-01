var fs = require('fs');
var mapshaper = require('mapshaper');
var iDir = './full-geojson/';
//var test = require(path);

fs.readdir(iDir, (err, files) => {
  files.forEach((file, i) => {
  	setTimeout(() => {
  		console.log('processing: ' + file);
  		mapshaper.runCommands('-i ' + iDir + file + ' -simplify 2% dp keep-shapes  -o geojson/ format=geojson ', (err) => { if (err) console.log(err)});
  	}, 1000 * i);
  });
});


