const d3 = require('d3');
const fs = require('fs');
const states = require('./data/states.json');

let candidates = [];

const stateNames = states.map(s => s.state);

const yearToYear = [
  // the civil war
  {
    state: 'VA',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'NC',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'SC',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'GA',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'TN',
    fromcongress: 36,
    tocongress: 39
  },
  {
    state: 'AR',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'FL',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'MS',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'AL',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'LA',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'TX',
    fromcongress: 36,
    tocongress: 41
  },
  {
    state: 'ME',
    fromcongress: 47,
    tocongress: 49
  },
  {
    state: 'VA',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'MN',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'MO',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'KY',
    fromcongress: 72,
    tocongress: 74
  },
  {
    state: 'AL',
    fromcongress: 87,
    tocongress: 89 
  },
];

const queryForState = function (state, fromcongress, tocongress) {
  console.log(`starting ${state} ${fromcongress} ${tocongress}`);
  const theQuery = `select 1786 + theprevious.endcong * 2 as fromyear, 1786 + thenext.startcong * 2 as toyear, theprevious.state as state, theprevious.id as previousDistrict, thenext.id as nextDistrict, st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(theprevious.the_geom) * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(thenext.the_geom) as overlap from congressional_districts theprevious, congressional_districts thenext where theprevious.startcong <= ${fromcongress} and theprevious.endcong >= ${fromcongress} and thenext.startcong <= ${tocongress} and thenext.endcong >= ${tocongress} and theprevious.state = thenext.state and st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(theprevious.the_geom) * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(thenext.the_geom) > 0.25 and theprevious.district != 0 and thenext.district != 0 and theprevious.state = '${state}' order by fromyear, state, overlap desc`;

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
