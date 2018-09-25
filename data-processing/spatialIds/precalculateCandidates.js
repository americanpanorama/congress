const d3 = require('d3');
const fs = require('fs');
const states = require('./data/states.json');

let candidates = [];

const stateNames = states.map(s => s.state);

const queryForState = function (state) {
  console.log(`starting ${state}`);
  const theQuery = `select 1786 + theprevious.endcong * 2 as fromyear, 1786 + thenext.startcong * 2 as toyear, theprevious.statename as state, theprevious.id as previousDistrict, thenext.id as nextDistrict, st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/theprevious.area * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/thenext.area as overlap from districts_copy_1 theprevious, districts_copy_1 thenext where theprevious.endcong = thenext.startcong - 1 and theprevious.statename = thenext.statename and st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(theprevious.the_geom) * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(thenext.the_geom) > 0.25 and theprevious.district != 0 and thenext.district != 0 and theprevious.statename = '${state}' order by fromyear, state, overlap desc`;

  d3.json(`https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=${encodeURIComponent(theQuery)}`, (err, d) => {
    if (err) {
      console.warn(state, err);
    } else {
      candidates = candidates.concat(d.rows);

      console.log(`finished ${state}`);
      const i = stateNames.indexOf(state);
      if (i === stateNames.length - 1) {
        // sort 
        candidates = candidates.sort((a, b) => {
          if (a.fromyear < b.fromyear) {
            return -1;
          }
          if (a.fromyear > b.fromyear) {
            return 1;
          }
          if (a.state < b.state) {
            return -1;
          }
          if (a.state > b.state) {
            return 1;
          }
          if (a.overlap > b.overlap) {
            return -1;
          }
          if (a.overlap < b.overlap) {
            return 1;
          }
          return 0;
        });
        // write the file
        fs.writeFile('./data/candidates2.json', JSON.stringify(candidates), (err) => {
          if (err) { return console.log(err); }
          console.log('The file was saved!');
          console.log('FINISHED MAKING candidates');
          console.log('finished');
        });
      } else {
        const nextState = stateNames[i + 1];
        queryForState(nextState);
      }
    }
  });
};

queryForState(stateNames[0]);