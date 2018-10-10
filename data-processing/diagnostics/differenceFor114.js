const fs = require('fs');

const unsimplifiedDir = '../full-geojson/';
const simplifiedDir = '../simplified-geojson/';

const yearForCongress = function (congress) { return 1786 + congress * 2; };

const simplifiedIds = JSON.parse(fs.readFileSync(`${simplifiedDir}114.json`, 'utf8')).features.map(f => f.properties.id);
const unsimplifiedIds = JSON.parse(fs.readFileSync(`${unsimplifiedDir}districts114.json`, 'utf8')).features.map(f => f.properties.ID);

unsimplifiedIds.forEach((id) => {
  if (!simplifiedIds.includes(id)) {
    console.log(id);
  }
});

console.log(simplifiedIds.length, unsimplifiedIds.length);
