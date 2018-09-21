// takes the final mapping and iterates through it to assign spatial ids to each district
// inputs ./data/mapping.json produced by ./makeFinalMapping.js
// outputs ./data/spatialIds.json

const fs = require('fs');
const mapping = require("./data/secondMapping.json");

const yearForCongress = function (congress) { return 1786 + congress * 2; },
  congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

var spatial_id = 0,
  spatialIds = {};

// initialize with the first congress's data
console.log('initializing for 1788');
Object.keys(mapping['1788']).forEach(state => {
  Object.keys(mapping['1788'][state]).forEach(currentDistrict => {
    spatialIds['spatialId' + spatial_id] = { 1788: currentDistrict};
    if (mapping['1788'][state][currentDistrict]) {
      spatialIds['spatialId' + spatial_id]['1790'] = mapping['1788'][state][currentDistrict];
    }
    spatial_id += 1;
  });
});
delete mapping['1788'];

Object.keys(mapping)
  .map(year => parseInt(year))
  .sort((a,b) => a - b)
  .forEach(year => {
    console.log('processing mapping for ' + year);

    Object.keys(mapping[year]).forEach(state => {
      Object.keys(mapping[year][state]).forEach(currentDistrict => {
        // check to see if you there's a match in the previous congress
        let previousSpatialId = false;
         Object.keys(spatialIds).forEach(spatialId => {
          if (spatialIds[spatialId][year] && spatialIds[spatialId][year] == currentDistrict) {
            previousSpatialId = true;
            // add the next one if there's a mapping
            if (mapping[year][state][currentDistrict]) {
              spatialIds[spatialId][year + 2] = mapping[year][state][currentDistrict];
            }
          }
        });
        // create a new spatialId
        if (!previousSpatialId) {
          spatialIds['spatialId' + spatial_id] = {};
          spatialIds['spatialId' + spatial_id][year] = currentDistrict;
          if (mapping[year][state][currentDistrict]) {
            spatialIds['spatialId' + spatial_id][year + 2] = mapping[year][state][currentDistrict];
          }
          spatial_id += 1;
        }
      });
    });
  });

fs.writeFile("./data/spatialIds.json", JSON.stringify(spatialIds), function(err) {
    if(err) { return console.log(err); }
    console.log("spatialIds file was saved!");
}); 
