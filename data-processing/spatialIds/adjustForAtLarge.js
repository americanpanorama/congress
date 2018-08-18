// creates a candidates json file of districts that aren't identical but spatially overlap one another
// outputs ./data/candidate.json

const d3 = require("d3");
const fs = require('fs');
const events = require('events');
const toSkipFunc = require('./calculateYearsToSkip');
const spatialIds = require('./data/spatialIds.json');
const states = require('./data/states.json');

var eventEmitter = new events.EventEmitter();



// load list of congress and states that will need to be mapped
const toSkip = toSkipFunc.maybeToSkip();
delete toSkip['2010'];

const baseUrlGeojson = 'https://digitalscholarshiplab.carto.com/api/v2/sql?format=GeoJSON&q=';
const baseUrlJson = 'https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=';
const queryTodo = 'select distinct (statename, endcong), endcong as congress, statename from districts order by congress, statename';
const queryAllDistricts = 'SELECT distinct on (id) id, statename, district, startcong, endcong FROM districts';

const yearForCongress = function (congress) { return 1786 + congress * 2; };
const congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };
const getStateName = function (code) {
  return states.find(s => s.postalCode === code).state;
};

const candidates = {};

//Create an event handler:
var myEventHandler = function () {
  console.log('candidates done');
}

//Assign the event handler to an event:
eventEmitter.on('candidatesDone', myEventHandler);



Object.keys(toSkip).forEach((year) => {
  const theYear = parseInt(year, 10);
  toSkip[year].forEach((state) => {
    // create a mapping of best matched districts for the congress before the year and the one after, skipping it
    let queryOverlap = `select previous.id as previous_district, next.id as next_district, st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) as overlap, previous.statename as state from (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename  FROM districts where endcong =  ${congressForYear(theYear - 2)} and statename = '${getStateName(state)}' and district != 0) previous join (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename FROM districts where startcong =  ${congressForYear(theYear + 2)} and statename = '${getStateName(state)}') next on previous.statename = next.statename and st_intersects(ST_CollectionExtract(previous.the_geom,3), ST_CollectionExtract(next.the_geom,3)) and  st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) > 0.05 order by overlap desc`;

    d3.json(baseUrlJson + queryOverlap, (err, cd) => {
      if (!cd) { 
        console.log(queryOverlap, err, cd);
      } else if (cd && cd.rows) {
        candidates[theYear - 2] = cd.rows;
      }
      toSkip[year] = toSkip[year].filter(s => s !== state);
      if (toSkip[year].length === 0) {
        delete toSkip[year];
      }

      if (Object.keys(toSkip).length === 0) {
        eventEmitter.emit('candidatesDone');
      }
    });
  });
});

// Object.keys(toDos).forEach((congress, i) => {
//   // setTimeout(() => {
//   //   console.log('starting Congress ' + congress + ' (' + yearForCongress(congress) + ')');
//   //   congress = parseInt(congress);

//   //   const statesArray = toDos[congress].map(state => "'" + state + "'").join(',');

//   //   // get the percentage overlaps for each district that does intersect
//   //   var queryOverlap = "select previous.id as previous_district, next.id as next_district, st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) as overlap, previous.statename as state from (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename  FROM districts where endcong =  " + congress + " and statename in (" + statesArray + ") and district != 0) previous join (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename FROM districts where startcong =  " + (congress + 1) + " and statename in (" + statesArray + ")) next on previous.statename = next.statename and st_intersects(ST_CollectionExtract(previous.the_geom,3), ST_CollectionExtract(next.the_geom,3)) and  st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) > 0.05 order by overlap desc";

//   //   d3.json(baseUrlJson + queryOverlap, (err, cd) => {
//   //     if (!cd) { 
//   //     	console.log(queryOverlap, err, cd); 
//   //     } else if (cd && cd.rows) {
//   //     	candidates[yearForCongress(congress)] = cd.rows;
//   //     }
//   //   });
//   //   delete toDos[congress];

//     if (Object.keys(toDos).length == 0) {
//     //   fs.writeFile("./data/candidates.json", JSON.stringify(candidates), function(err) {
//     //       if(err) { return console.log(err); }
//     //       console.log("candidates file was saved!");
//     //   }); 
//     // }
//   }, 500 * i);
// });