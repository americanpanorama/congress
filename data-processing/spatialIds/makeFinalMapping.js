// this file creates a map of "spatialIds" for districts. These spatial ids are used to map districts across time to each other based upon how much they overlap. For one, this is used to move rather than recreate bubbles on the cartogram
// input: ./data/preliminaryMapping.json produced by ./makePreliminaryMapping.js
// input: ./data/candidates.json produced by ./makeCandidates.js
// outputs ./data/mapping.json

const fs = require('fs');
const preliminaryMapping = require('./makePreliminaryMapping.js');

// the todos are an object where the key is the congress number and the value an array of states that have one or more districts requiring mapping. Code to produce it is commented at the bottom.
const candidates = require("./data/candidates.json");

const yearForCongress = function (congress) { return 1786 + congress * 2; },
  congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

const mapping = preliminaryMapping.preliminaryMapping();

// iterate through each of these congresses and states producing the mappings
Object.keys(candidates).forEach((year, i) => {
  console.log('starting Congress for ' + year);
  console.log(candidates[year].length + ' matches to test');

  var currentDistrictLists = Array.from(new Set(candidates[year].map(intersection => intersection.previous_district))),
    candidatesList = Array.from(new Set(candidates[year].map(intersection => intersection.next_district))),
    numMapped = 0,
    numNeedingMapping = currentDistrictLists.length;

  // iterate through the results one by one assigning candidates
  candidates[year].forEach(intersection => {
    if (currentDistrictLists.length > 0 && candidatesList.length > 0 && currentDistrictLists.includes(intersection.previous_district) && candidatesList.includes(intersection.next_district)) {
      // map the candidate
      mapping[year][intersection.state][intersection.previous_district] = intersection.next_district;

      // remove the mapped district and the potential candidate from the two respective lists
      currentDistrictLists = currentDistrictLists.filter(id => id != intersection.previous_district);
      candidatesList = candidatesList.filter(id => id != intersection.next_district);
      numMapped += 1;
    }
  });

  console.log('mapped ' + numMapped + ' of ' + numNeedingMapping);
  console.log("finished Congress for " + year + "\n");
});

fs.writeFile("./data/mapping.json", JSON.stringify(mapping), function(err) {
    if(err) { return console.log(err); }
    console.log("final mapping file was saved!");
}); 