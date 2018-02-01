var fs = require('fs');
var mapshaper = require('mapshaper');
var iDir = './geojson/';
fs.readdir(iDir, (err, files) => {
  var fileString = files.filter(fn => fn.includes('.json')).map(fn => iDir + fn).join(' ');
  mapshaper.runCommands('-i ' + fileString + ' merge-files  -o districts.json format=geojson ', (err) => { if (err) console.log(err)});
});