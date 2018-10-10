const d3 = require('d3');
const fs = require('fs');
const states = require('./data/states.json');

let candidates = [];

const stateNames = states.map(s => s.postalCode);

const abbrAndFIPS = {"AK": "02", "AL": "01", "AR": "05", "AS": "60", "AZ": "04", "CA": "06", "CO": "08", "CT": "09", "DC": "11", "DE": "10", "FL": "12", "GA": "13", "GU": "66", "HI": "15", "IA": "19", "ID": "16", "IL": "17", "IN": "18", "KS": "20", "KY": "21", "LA": "22", "MA": "25", "MD": "24", "ME": "23", "MI": "26", "MN": "27", "MO": "29", "MS": "28", "MT": "30", "NC": "37", "ND": "38", "NE": "31", "NH": "33", "NJ": "34", "NM": "35", "NV": "32", "NY": "36", "OH": "39", "OK": "40", "OR": "41", "PA": "42", "PR": "72", "RI": "44", "SC": "45", "SD": "46", "TN": "47", "TX": "48", "UT": "49", "VA": "51", "VI": "78", "VT": "50", "WA": "53", "WI": "55", "WV": "54", "WY": "56"};
const getStateFromFIPS = function (fips) {
  let abbr;
  Object.keys(abbrAndFIPS).forEach((s) => {
    if (parseInt(fips) === parseInt(abbrAndFIPS[s])) {
      abbr = s;
    }
  });
  return abbr;
};

// Object.keys(abbrAndFIPS).forEach((s) => {
//   const update = `update congressional_districts set state = '${s}' where fips = '0${abbrAndFIPS[s]}';`;
//   console.log(update);
// });
// lkjdfl;jk

const queryForState = function (state) {
  console.log(`starting ${state}`);
  const theQuery = `select 1786 + theprevious.endcong * 2 as fromyear, 1786 + thenext.startcong * 2 as toyear, theprevious.state as state, theprevious.id as previousDistrict, thenext.id as nextDistrict, st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(theprevious.the_geom) * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(thenext.the_geom) as overlap from congressional_districts theprevious, congressional_districts thenext where theprevious.endcong = thenext.startcong - 1 and theprevious.state = thenext.state and st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(theprevious.the_geom) * st_area(st_intersection(theprevious.the_geom, thenext.the_geom))/st_area(thenext.the_geom) > 0.25 and theprevious.district::integer != 0 and thenext.district::integer != 0 and theprevious.state = '${state}'  order by fromyear, state, overlap desc`;

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
