const fs = require('fs');

const ids = [];

// empty the file
fs.writeFileSync('./congressional_districts.geojson', '');

for (let c = 1; c <= 115; c += 1) {
  console.log(`starting ${c}`);

  const current = fs.readFileSync('./congressional_districts.geojson');
  const districtsGeojson = (current.length > 0) ? JSON.parse(current) : { type: 'FeatureCollection', features: [] };

  const path = `final-simplified-geojson/${c}.json`;
  const ds = JSON.parse(fs.readFileSync(path)).features;
  ds.forEach((d) => {
    if (!ids.includes(d.properties.id)) {
      districtsGeojson.features.push(d);
      ids.push(d.properties.id);
    }
  });

  fs.writeFileSync('./congressional_districts.geojson', JSON.stringify(districtsGeojson));
  console.log(`wrote ${c}: ${districtsGeojson.features.length} features`);
}
