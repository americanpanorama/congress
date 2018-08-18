// this processes the candidates list (created by candidates.js file) to complete a spatial mapping (seeded by preliminaryMapping.js)

const fs = require('fs');

// the todos are an object where the key is the congress number and the value an array of states that have one or more districts requiring mapping. Code to produce it is commented at the bottom.
const toDos = require("./data/toDos.json"),
  candidates = require("/data/candidates.json"),
  mapping = require("./data/preliminaryMapping.json");

const yearForCongress = function (congress) { return 1786 + congress * 2; },
  congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

// const lookBackForSpatialId = (districtId, congressNum, state) {
//   // look for the district in the previous congress 
//   if (!mapping[congressNum-1][state]) {
//     return false;
//   }
//   Object.keys(mapping[congressNum-1][state]).forEach(aDistrictId => {
//     if (mapping[congressNum-1][state][aDistrictId] == districtId) {
//       return aDistrictId;
//     }
//   });
// };

// do some diagnostics
// var statesToCalculate = [];
// for (let congress = 1; congress <= 115; congress++) {
//   var districtsForCongress = mapping.filter(d => d.congress == congress),
//     unmapped = districtsForCongress.filter(d => !d.mapToId);
//   console.log(congress + ': ' + unmapped.length + ' of ' + districtsForCongress.length + ' unmapped');
//   statesToCalculate.push([...new Set(unmapped.map(d => "'" + d.state + "'"))].join(','));
// }

//for testing, just do the first few
// Object.keys(toDos).forEach(c => {
//   if (c != 27) {
//     delete toDos[c];
//   }
// });
// mapping = mapping.filter(d => d.congress == 27);

var currentlyProcessing = [];

// iterate through each of these congresses and states producing the mappings
Object.keys(toDos).forEach((congress, i) => {
  setTimeout(() => {
    console.log('starting Congress ' + congress + ' (' + yearForCongress(congress) + ')');
    currentlyProcessing.push(congress);
    console.log('currently processing: ' + currentlyProcessing.join());
    congress = parseInt(congress);

    const statesArray = toDos[congress].map(state => "'" + state + "'").join(',');
    //unchangedDistricts = mapping.filter(d => d.congress == congress + 1 && d.next).map(d => "'" + d.next + "'").join(',');

    // get the percentage overlaps for each district that does intersect
    var queryOverlap = "select previous.id as previous_district, next.id as next_district, st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) as overlap, previous.statename as state from (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename  FROM districts_1 where endcong =  " + congress + " and statename in (" + statesArray + ") and district != 0) previous join (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename FROM districts_1 where startcong =  " + (congress + 1) + " and statename in (" + statesArray + ")) next on previous.statename = next.statename and st_intersects(ST_CollectionExtract(previous.the_geom,3), ST_CollectionExtract(next.the_geom,3)) and  st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) > 0.05 order by overlap desc";

    d3.json(baseUrlJson + queryOverlap, (err, cd) => {
      if (!cd) { console.log(queryOverlap, err, cd); }
      if (cd && cd.rows) {
        fs.writeFile("./raw-data/spatialIds/candidates/" + congress + ".json", JSON.stringify(cd.rows), function(err) {
            if(err) { return console.log(err); }
            console.log("candidates file for " + congress + " saved to " + "./raw-data/spatialIds/candidates/" + congress + ".json");
        }); 
        console.log(cd.rows.length + ' matches to test');
        // get the district ids that need to be mapped and initiate a mapping object
        var currentDistrictLists = Array.from(new Set(cd.rows.map(intersection => intersection.previous_district))),
          candidatesList = Array.from(new Set(cd.rows.map(intersection => intersection.next_district))),
          numMapped = 0,
          numNeedingMapping = currentDistrictLists.length,
          numCandidates = candidatesList.length;

        // iterate through the results one by one assigning candidates
        cd.rows.forEach(intersection => {
          if (currentDistrictLists.length > 0 && candidatesList.length > 0 && currentDistrictLists.includes(intersection.previous_district) && candidatesList.includes(intersection.next_district)) {
            // map the best candidate
            // var i = currentDistrictsMapping.findIndex(d => d.previous == intersection.previous_district);
            // currentDistrictsMapping[i].next = intersection.next_district;
            mapping[yearForCongress(congress)][intersection.state][intersection.previous_district] = intersection.next_district;
            // remove the current district and the chosen candidate from their respective lists 
            currentDistrictLists = currentDistrictLists.filter(id => id != intersection.previous_district);
            candidatesList = candidatesList.filter(id => id != intersection.next_district);
            numMapped++;
          }
        });

        //mapping = mapping.concat(currentDistrictsMapping);
        console.log('mapped ' + numMapped + ' of ' + numNeedingMapping);
        console.log("finished Congress " + congress + ' (' + yearForCongress(congress) + ')' + "\n");
        delete toDos[congress];
        console.log("remaining: " + Object.keys(toDos).length);
        // remove from the toDo list
        currentlyProcessing = currentlyProcessing.filter(c => c != congress);
        //console.log((Object.keys(toDos).length > 0) ? 'Remaining: ' + Object.keys(toDos).join() : 'FINISHED CANDIDATE SELECTION -- BEGINNING PROCESSING');

        if (Object.keys(toDos).length == 0) {
          fs.writeFile("./idMapping.json", JSON.stringify(mapping), function(err) {
              if(err) { return console.log(err); }
              console.log("Mapping file was saved!");
          }); 
          // process(mapping);

          // reorganize into lists by congress
          // var congressMapping = {};
          // mapping.forEach(aMapping => {
          //   congressMapping[parseInt(aMapping.congress)] = congressMapping[parseInt(aMapping.congress)] || [];
          //   congressMapping[parseInt(aMapping.congress)].push({
          //     current: aMapping.previous,
          //     next: aMapping.next
          //   });
          // });

          // console.log(congressMapping);

          var spatial_id = 0,
            spatialIds = {};
          Object.keys(mapping)
            .map(year => parseInt(year))
            .sort((a,b) => a - b)
            .forEach(year => {
              console.log('processing mapping for ' + year);
              // initialize for congress 1
              if (year == 1788) {
                Object.keys(mapping[year]).forEach(state => {
                  Object.keys(mapping[year][state]).forEach(currentDistrict => {
                    spatialIds['spatialId' + spatial_id] = {};
                    spatialIds['spatialId' + spatial_id][year] = currentDistrict
                    if (mapping[year][currentDistrict]) {
                      spatialIds['spatialId' + spatial_id][year + 2] = mapping[year][currentDistrict];
                    }
                    spatial_id += 1;
                  });
                });
              } else {
                Object.keys(mapping[year]).forEach(state => {
                  Object.keys(mapping[year][state]).forEach(currentDistrict => {
                    // check to see if you there's a match in the previous congress
                    let previousSpatialId = false;
                    // if (mapping[congress-1] && mapping[congress-1][state]) {
                    //   Object.keys(mapping[congress-1][state]).forEach(aDistrictId => {
                    //     if (mapping[congress-1][state][aDistrictId] == currentDistrict) {
                    //       // find the spatial id for the located district
                    //       Object.keys(spatialIds).forEach(aSpatialId => {
                    //         if (spatialIds[aSpatialId][congress-1] && spatialIds[aSpatialId][congress-1] == aDistrictId) {
                    //           previousSpatialId = aSpatialId;
                    //         }
                    //       });
                    //     }
                    //   });
                    // }
                     Object.keys(spatialIds).forEach(spatialId => {
                      if (spatialIds[spatialId][year] && spatialIds[spatialId][year] == currentDistrict) {
                        previousSpatialId = true;
                        console.log(spatialId, year, currentDistrict);
                        // add the next one if there's a mapping
                        if (mapping[year][state][currentDistrict]) {
                          spatialIds[spatialId][year + 2] = mapping[year][currentDistrict];
                        }
                      }
                    });
                    // // if there is and there's a next district, add the latter
                    // if (previousSpatialId) {
                    //   spatialIds[previousSpatialId][year] = currentDistrict;
                    // } 
                    // otherwise, create a new spatialId
                    if (!previousSpatialId) {
                      spatialIds['spatialId' + spatial_id] = {};
                      spatialIds['spatialId' + spatial_id][year] = currentDistrict;
                      if (mapping[year][state][currentDistrict]) {
                        spatialIds['spatialId' + spatial_id][year + 2] = mapping[year][currentDistrict];
                      }
                      spatial_id += 1;
                    }
                  });
                });
              }
            });

          console.log(spatialIds);

          var lookups = {};
          Object.keys(spatialIds).forEach(spatialId => {
            Object.keys(spatialIds[spatialId]).forEach(year => {
              lookups[year] = lookups[year] || {}; 
              lookups[year][spatialIds[spatialId][year]] = spatialId;
            });
          });

          fs.writeFile("./idMap.json", JSON.stringify(lookups), function(err) {
              if(err) { return console.log(err); }
              console.log("The file was saved!");
          }); 
        }
      }
    });
  }, 500 * i);
});










  // d3.json(baseUrlJson + queryChangedStates, (err, cd) => {
  //   if (cd.rows) {
  //     var changedStates= cd.rows.map(s => s.statename);

  //     changedStates.forEach(state => {
  //       // queryChangedFrom = "SELECT distinct on (id) id, cartodb_id, the_geom, statename, district, startcong, endcong FROM digitalscholarshiplab.congressional_districts where endcong =  " + congressNum + " and statename = '" + state + "'";
  //       // console.log(queryChangedFrom);


  //     });

      

  //   }
// });

  // queryUnchanged = "SELECT distinct on (id) id, cartodb_id, the_geom, statename, district, startcong, endcong FROM congressional_districts where startcong <= " + congressNum +" and endcong >=  " + (congressNum + 1),
  // queryChangedStates = "SELECT distinct (statename) FROM digitalscholarshiplab.congressional_districts where endcong = " + congressNum,
  // queryChanged = "SELECT distinct on (id) id, cartodb_id, the_geom, statename, district, startcong, endcong FROM digitalscholarshiplab.congressional_districts where endcong =  " + congressNum,
  // queryChangedTo = "SELECT distinct on (id) id, cartodb_id, the_geom, statename, district, startcong, endcong FROM digitalscholarshiplab.congressional_districts where startcong =  " + (congressNum + 1);







/* // CODE TO PRODUCE toDos
d3.json("https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=select distinct (statename, endcong), endcong as congress, statename from districts_1 order by congress, statename", (err, d) => {
  var toDos = {};
  d.rows.forEach(toDo => {
    toDos[toDo.congress] = toDos[toDo.congress] || [];
    toDos[toDo.congress].push(toDo.statename);
  });

  fs.writeFile("./raw-data/spatialIds/toDos.json", JSON.stringify(toDos), function(err) {
      if(err) { return console.log(err); }
      console.log("The file was saved!");
  }); 
}); 
*/

/* // CODE TO PRODUCE mapping
var mapping = [],
  mappingObject = {};
d3.json(baseUrlJson + queryAllDistricts, (err, d) => {
  // obviously, if the district spans multiple years/congresses, the mapping is to itself
  d.rows.forEach(district => {
    for (let congress = district.startcong; congress <= district.endcong; congress++) {
      mapping.push({
        congress: congress,
        state: district.statename,
        id: district.id,
        mapToId: (district.endcong > congress) ? district.id : null
      });
    }
  });
  mapping.sort((a,b) => {
    if (a.congress < b.congress) {
      return -1;
    } else if (a.congress > b.congress) {
      return 1;
    } else if (a.state < b.state) {
      return -1;
    } else if (a.state > b.state) {
      return 1;
    } else if (!a.mapToId && b.mapToId) {
      return -1;
    } else if (a.mapToId && !b.mapToId) {
      return 1;
    }
    return 0;
  });
  mapping.forEach(d => {
    mappingObject[yearForCongress(d.congress)] = mappingObject[yearForCongress(d.congress)] || {};
    mappingObject[yearForCongress(d.congress)][d.state] = mappingObject[yearForCongress(d.congress)][d.state] || {};
    mappingObject[yearForCongress(d.congress)][d.state][d.id] = d.mapToId;
  });
  fs.writeFile("./raw-data/spatialIds/preliminaryMapping.json", JSON.stringify(mappingObject), function(err) {
      if(err) { return console.log(err); }
      console.log("The file was saved!");
  }); 
});
*/





