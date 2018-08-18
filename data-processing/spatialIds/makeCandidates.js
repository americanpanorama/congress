// creates a candidates json file of districts that aren't identical but spatially overlap one another
// outputs ./data/candidate.json

const d3 = require("d3"),  
	fs = require('fs');

// load list of congress and states that will need to be mapped
const toDos = require("./data/toDos.json");

const baseUrlGeojson = "https://digitalscholarshiplab.carto.com/api/v2/sql?format=GeoJSON&q=",
  baseUrlJson = "https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=",
  queryTodo = "select distinct (statename, endcong), endcong as congress, statename from districts order by congress, statename",
  queryAllDistricts = "SELECT distinct on (id) id, statename, district, startcong, endcong FROM districts";

const yearForCongress = function (congress) { return 1786 + congress * 2; },
  congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

var candidates = {};

Object.keys(toDos).forEach((congress, i) => {
  setTimeout(() => {
    console.log('starting Congress ' + congress + ' (' + yearForCongress(congress) + ')');
    congress = parseInt(congress);

    const statesArray = toDos[congress].map(state => "'" + state + "'").join(',');

    // get the percentage overlaps for each district that does intersect
    var queryOverlap = "select previous.id as previous_district, next.id as next_district, st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) as overlap, previous.statename as state from (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename  FROM districts where endcong =  " + congress + " and statename in (" + statesArray + ") and district != 0) previous join (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename FROM districts where startcong =  " + (congress + 1) + " and statename in (" + statesArray + ")) next on previous.statename = next.statename and st_intersects(ST_CollectionExtract(previous.the_geom,3), ST_CollectionExtract(next.the_geom,3)) and  st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) > 0.05 order by overlap desc";

    d3.json(baseUrlJson + queryOverlap, (err, cd) => {
      if (!cd) { 
      	console.log(queryOverlap, err, cd); 
      } else if (cd && cd.rows) {
      	candidates[yearForCongress(congress)] = cd.rows;
      }
    });
    delete toDos[congress];

    if (Object.keys(toDos).length == 0) {
      fs.writeFile("./data/candidates.json", JSON.stringify(candidates), function(err) {
          if(err) { return console.log(err); }
          console.log("candidates file was saved!");
      }); 
    }
  }, 500 * i);
});