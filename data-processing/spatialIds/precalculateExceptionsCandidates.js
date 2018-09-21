const d3 = require('d3');
const fs = require('fs');
const states = require('./data/states.json');

let candidates = [];

const stateNames = states.map(s => s.state);

const yearToYear = [
  // the civil war
  {
    state: 'Virginia',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'North Carolina',
    fromcongress: 36,
    tocongress: 40
  },
  {
    state: 'South Carolina',
    fromcongress: 36,
    tocongress: 40
  },
  {
    state: 'Georgia',
    fromcongress: 36,
    tocongress: 40
  },
  {
    state: 'Tennessee',
    fromcongress: 36,
    tocongress: 39
  },
  {
    state: 'Arkansas',
    fromcongress: 36,
    tocongress: 40
  },
  {
    state: 'Florida',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'Mississippi',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'Alabama',
    fromcongress: 36,
    tocongress: 40
  },
  {
    state: 'Louisiana',
    fromcongress: 36,
    tocongress: 40
  },
  {
    state: 'Texas',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'Maine',
    fromcongress: 47,
    tocongress: 49
  },
  {
    state: 'Virginia',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'Minnesota',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'Missouri',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'Kentucky',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'Alabama',
    fromcongress: 87,
    tocongress: 89 
  },
];

const queryForState = function (state, fromcongress, tocongress) {
  console.log(`starting ${state} ${fromcongress} ${tocongress}`);
  const theQuery = `select 1786 + theprevious.endcong * 2 as fromyear, 1786 + thenext.startcong * 2 as toyear, theprevious.statename as state, theprevious.id as previousDistrict, thenext.id as nextDistrict, st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/theprevious.area * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/thenext.area as overlap from districts_copy_1 theprevious, districts_copy_1 thenext where theprevious.endcong = ${fromcongress} and thenext.startcong = ${tocongress} and theprevious.statename = thenext.statename and st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(theprevious.the_geom) * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(thenext.the_geom) > 0.25 and theprevious.district != 0 and thenext.district != 0 and theprevious.statename = '${state}' order by fromyear, state, overlap desc`;

  d3.json(`https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=${encodeURIComponent(theQuery)}`, (err, d) => {
    if (err) {
      console.warn(state, err);
    } else {
      candidates = candidates.concat(d.rows);

      console.log(`finished ${state} ${fromcongress} ${tocongress}`);
      const i = yearToYear.findIndex(s => s.state === state && s.fromcongress === fromcongress
        && s.tocongress === tocongress);
      if (i === yearToYear.length - 1) {
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
        fs.writeFile('./data/candidatesExceptions.json', JSON.stringify(candidates), (err) => {
          if (err) { return console.log(err); }
          console.log('The file was saved!');
          console.log('FINISHED MAKING candidates');
          console.log('finished');
        });
      } else {
        const nextstate = yearToYear[i + 1].state;
        const nextfromcongress = yearToYear[i + 1].fromcongress;
        const nexttocongress = yearToYear[i + 1].tocongress;
        queryForState(nextstate, nextfromcongress, nexttocongress);
      }
    }
  });
};

const { state, fromcongress, tocongress } = yearToYear[0];

queryForState(state, fromcongress, tocongress);
