// takes the spatialIds object and makes a lookup object (districtId: spatialId) for the application

const fs = require('fs');
const spatialIds = require("./data/spatialIds.json");

const lookups = {};
Object.keys(spatialIds).forEach((spatialId) => {
  Object.keys(spatialIds[spatialId]).forEach((year) => {
    lookups[year] = lookups[year] || {};
    lookups[year][spatialIds[spatialId][year]] = spatialId;
  });
});

fs.writeFile("./data/idMap.json", JSON.stringify(lookups), function(err) {
  if(err) { return console.log(err); }
  console.log("The file was saved!");
}); 
