// this calculates the label positions--i.e. the pole of inaccessiblity--for each district

const fs = require('fs');
const GeojsonArea = require('@mapbox/geojson-area');
const Polylabel = require('polylabel');

const iDir = './final-simplified-geojson/';

const calculated = [];

const features = [];

fs.readdir(iDir, (err, files) => {
  if (err) {
    console.warn('err');
  }

  files.forEach((file) => {
    console.log(file);
    if (file.includes('.json') && parseInt(file) >= 27) {
      const theGeojson = JSON.parse(fs.readFileSync(`${iDir}/${file}`, 'utf8'));

      theGeojson.features.forEach((feature, i) => {
        const { id } = feature.properties;

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
    }
  });

  const theJson = {
    type: 'FeatureCollection',
    features: features
  };

  console.log(JSON.stringify(theJson));
});
