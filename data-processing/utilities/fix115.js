const fs = require('fs');

const corrected = { 'type': 'FeatureCollection', features: [] };

const uncorrectedFeatures = JSON.parse(fs.readFileSync('../districts/final-simplified-geojson/115.json')).features;
corrected.features = uncorrectedFeatures.map((f) => {
  const cf = Object.assign({}, f);
  return {
    type: 'Feature',
    geometry: cf.geometry,
    properties: {
      id: `000${cf.properties.fips}115115${cf.properties.id.slice(-3)}`.slice(-12),
      startcong: 115,
      endcong: 115,
      district: cf.properties.district,
      fips: cf.properties.fips
    }
  };
});
console.log(JSON.stringify(corrected));
