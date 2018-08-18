// this calculates the label positions--i.e. the pole of inaccessiblity--for each district

const fs = require('fs');
const d3 = require('d3');
const GeojsonArea = require('@mapbox/geojson-area');
const Polylabel = require('polylabel');

const iDir = './simplified-geojson/';

const projection = d3.geoAlbersUsa();
const path = d3.geoPath().projection(projection);

const calculated = [];

const features = [];

fs.readdir(iDir, (err, files) => {
  if (err) {
    console.warn('err');
  }

  files.forEach((file) => {
    if (file.includes('.json')) {
      const theGeojson = JSON.parse(fs.readFileSync(`${iDir}/${file}`, 'utf8'));

      theGeojson.features.forEach((feature, i) => {
        const id = feature.properties.ID;

        if (!calculated.includes(id)) {
          // find the largest polygon
          let labelCoords;
          if (feature.geometry) {
            let iOfLargest = 0;
            if (feature.geometry.type === 'MultiPolygon') {
              let largest = 0;
              feature.geometry.coordinates.forEach((coordinates, j) => {
                const area = GeojsonArea.geometry({ type: 'Polygon', coordinates: coordinates });
                if (area > largest) {
                  iOfLargest = j;
                  largest = area;
                }
              });
            }

            // select the polygon to use
            let theCoords = null;
            if (feature.geometry.type === 'MultiPolygon') {
              theCoords = feature.geometry.coordinates[iOfLargest];
            } else if (feature.geometry.type === 'Polygon') {
              theCoords = feature.geometry.coordinates;
            }

            // calculate the point
            if (theCoords) {
              labelCoords = Polylabel(theCoords, 0.1);
            }
          }

          if (labelCoords) {
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: labelCoords
              },
              properties: {
                id: id
              }
            });
          }
          calculated.push(id);
        }
      });

      //fs.writeFileSync(`./processed-simplified-geojson/${file}`, JSON.stringify(theGeojson));
    }
  });

  const theJson = {
    type: 'FeatureCollection',
    features: features
  };

  console.log(JSON.stringify(theJson));
});
