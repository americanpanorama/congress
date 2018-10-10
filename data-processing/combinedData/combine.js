const fs = require('fs');
const d3 = require('d3');
const dissolve = require('geojson-dissolve');
const elections = require('../elections/data/elections.json');
const bubbles = require('./bubbleXYs.json');
const spatialIds = require('../spatialIds/data/idMap.json');
const metroNames = require('./metroNames.json');

const project = d3.geoPath(d3.geoAlbersUsa().scale(1).translate([0, 0]));
const yearForCongress = congress => 1786 + congress * 2;
const congressForYear = year => Math.round(d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year));

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

const processedData = {};

// Object.keys(elections).forEach((year) => {
//   if (parseInt(year) < 2012) {
//     delete elections[year];
//   }
// });

Object.keys(elections).forEach((year) => {
  const electionsPlus = [];
  const states = [];
  const filePath = `../districts/final-simplified-geojson/${congressForYear(year)}.json`;
  const { features } = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const yearBubbles = bubbles.find(d => d.year === parseInt(year));
  let cityBubbles = [];
  if (yearBubbles) {
    cityBubbles = yearBubbles.cities
      .map((c) => {
        if (!metroNames[c.id.trim()]) {
          console.log(c.id);
          jdkfsl;
        }
        c.id = metroNames[c.id.trim()];
        return c;
      });
  }

  Object.keys(elections[year]).forEach((state) => {
    const bubblesForYear = (yearBubbles) ? yearBubbles.districts : [];
    const geojsonForState = [];
    Object.keys(elections[year][state]).forEach((districtType) => {
      if (districtType === 'GT' || districtType === 'AL') {
        elections[year][state][districtType].forEach((alDistrict, i) => {
          const electionPlus = alDistrict;
          if (electionPlus.plural === false) {
            delete electionPlus.plural;
          }
          const districtId = electionPlus.id;
          const id = `${electionPlus.id}-${i}`;
          electionPlus.id = id;
          electionPlus.districtType = districtType;
          electionPlus.onlyAL = elections[year][state][districtType].length === 1;

          // single AL districts use the districtId, multiple AL districts and all GT elections use the spatialId
          //const theId = (electionPlus.onlyAL) ? districtId : id;
          const theId = id;

          // if (state === 'WY') {
          //   console.log(electionPlus);
          //   console.log(districtId, id, theId);
          // }

          if (spatialIds[year][theId]) {
            electionPlus.spatialId = parseInt(spatialIds[year][theId].slice(9));

            // get the bubble coords
            const bubbleForDistrict = bubblesForYear.find(d => d.id === id);
            let x;
            let y;
            let xOrigin;
            let yOrigin;
            if (bubbleForDistrict) {
              ({ x, y, xOrigin, yOrigin } = bubbleForDistrict);
            } else {
              console.warn(`no bubble for ${year} ${state} ${id}`);
            }
            const stateAbbr = getStateFromFIPS(parseInt(id.slice(0, 3)));

            electionPlus.x = x;
            electionPlus.y = y;
            electionPlus.xOrigin = xOrigin;
            electionPlus.yOrigin = yOrigin;
            electionPlus.state = stateAbbr;

            // get the spatial data
            const feature = features.find(d => d.properties.id === districtId) ||
              features.find(d => d.properties.id === districtId.slice(0, 12));

            if (feature) {
              const theGeojson = feature.geometry;
              const svg = project(theGeojson);
              electionPlus.svg = svg;

              electionPlus.bounds = project.bounds(theGeojson);

              // add the geojson to the state list to be combined below
              if (theGeojson) {
                geojsonForState.push(theGeojson);
              }
            }

            // if (state === 'WY') {
            //   console.log(electionPlus);
            // }

            electionsPlus.push(electionPlus);
          }
        });
      } else {
        const electionPlus = elections[year][state][districtType];
        if (electionPlus.plural === false) {
          delete electionPlus.plural;
        }
        const { id } = electionPlus;
        electionPlus.districtType = districtType;

        // get the spatialId
        electionPlus.spatialId = (spatialIds[year] && spatialIds[year][id]) ? parseInt(spatialIds[year][id].slice(9)) : -1;

        // get the bubble coords
        const bubbleForDistrict = bubblesForYear.find(d => d.id === id);
        if (!bubbleForDistrict) {
          //console.log(`no bubble for: ${year}, ${id}`);
        } else {
          const {
            x,
            y,
            xOrigin,
            yOrigin
          } = bubbleForDistrict;

          electionPlus.x = x;
          electionPlus.y = y;
          electionPlus.xOrigin = xOrigin;
          electionPlus.yOrigin = yOrigin;
          electionPlus.state = getStateFromFIPS(parseInt(id.slice(0, 3)));
        }

        // get the spatial data
        const feature = features.find(d => d.properties.id === id);

        if (feature) {
          const theGeojson = features.find(d => d.properties.id === id).geometry;
          const svg = project(theGeojson);
          electionPlus.svg = svg;

          electionPlus.bounds = project.bounds(theGeojson);

          // add the geojson to the state list to be combined below
          if (theGeojson) {
            geojsonForState.push(theGeojson);
          }
        }

        // look backwards to see determined flipped or not
        let flipped = false;
        const priorElections = processedData[parseInt(year) - 2];
        if (priorElections) {
          const priorElection = priorElections.find(e => e.spatialId === electionPlus.spatialId);
          // only flip between major parties
          if (priorElection
            && ((priorElection.partyReg === 'democrat' && (electionPlus.partyReg === 'whig' || electionPlus.partyReg === 'republican'))
            || ((priorElection.partyReg === 'republican' || priorElection.partyReg === 'whig') && (electionPlus.partyReg === 'democrat')))) {
            flipped = true;
          }
          // if (priorElection && priorElection.partyReg !== electionPlus.partyReg) {
          //   flipped = true;
          // }
          // // a big exception: don't adjust opposition in 1854 if it switched from whig or to republican
          // if (year === '1854' && priorElection && priorElection.partyReg === 'whig' && electionPlus.partyReg === 'opposition') {
          //   flipped = false;
          // }
          // if (year === '1856' && priorElection && priorElection.partyReg === 'opposition' && electionPlus.partyReg === 'republican') {
          //   flipped = false;
          // }
        }
        electionPlus.flipped = flipped;

        electionsPlus.push(electionPlus);

        // see if it's in a city
        const inCityI = cityBubbles.findIndex((cb) => {
          const xDiff = cb.x - electionPlus.x;
          const yDiff = cb.y - electionPlus.y;
          return cb.r >= Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        });

        if (inCityI >= 0) {
          if (!id) {
            console.log(`missing city for ${inCityI}`);
          } else {
            cityBubbles[inCityI].districts = cityBubbles[inCityI].districts || [];
            cityBubbles[inCityI].districts.push(electionPlus.spatialId);

            cityBubbles[inCityI].parties = cityBubbles[inCityI].parties || {};
            cityBubbles[inCityI].parties.democrat = cityBubbles[inCityI].parties.democrat || 0;
            cityBubbles[inCityI].parties.third = cityBubbles[inCityI].parties.third || 0;
            if (year >= 1856) {
              cityBubbles[inCityI].parties.republican = cityBubbles[inCityI].parties.republican || 0;
            }
            if (year <= 1852) {
              cityBubbles[inCityI].parties.whig = cityBubbles[inCityI].parties.whig || 0;
            }
            cityBubbles[inCityI].parties[electionPlus.partyReg] += 1;

            cityBubbles[inCityI].count = cityBubbles[inCityI].count || 0;
            cityBubbles[inCityI].count += 1;

            cityBubbles[inCityI].flipped = cityBubbles[inCityI].flipped || 0;
            if (electionPlus.flipped) {
              cityBubbles[inCityI].flipped += 1;
            }
          }
        }
      }
    });

    if (geojsonForState.length > 0) {
      const isGT = Object.keys(elections[year][state]).includes('GT');
      let stateSVG;
      if (!isGT) {
        const stateGeojson = dissolve(geojsonForState);
        stateSVG = project(stateGeojson);
      } else {
        // console.log(`state: ${state}`);
        // console.log(electionsPlus.find(e => e.state === 'NM'));
        const gtDistrict = electionsPlus.find(e => e.districtType === 'GT' && e.state === state);
        if (gtDistrict && gtDistrict.svg) {
          stateSVG = gtDistrict.svg;
        }
      }
      const aState = {
        state: state,
        svg: stateSVG
      };

      if (isGT) {
        aState.gt = true;
      }

      states.push(aState);
    }
  });

  processedData[year] = electionsPlus;

  const yearData = {
    elections: electionsPlus,
    cityBubbles: cityBubbles,
    states: states
  };

  // write to file
  const newFilePath = `../../build/static/elections/${year}.json`;
  fs.writeFile(newFilePath, JSON.stringify(yearData, null, ' '), (err) => {
    if (err) throw err;
    console.log(`created: ../../build/static/elections/${year}.json`);
  });
});

// mmake a file for each spatial id
const spatialIdsData = {};

Object.keys(processedData).forEach((year) => {
  processedData[year].forEach((e) => {
    spatialIdsData[e.spatialId] = spatialIdsData[e.spatialId] || [];
    spatialIdsData[e.spatialId].push({
      year: parseInt(year),
      percent: e.percent,
      partyReg: e.partyReg
    });
  });
});

// write the spatialId files
Object.keys(spatialIdsData).forEach((spatialId) => {
  const newFilePath = `../../build/static/space-data/${spatialId}.json`;
  fs.writeFile(newFilePath, JSON.stringify(spatialIdsData[spatialId], null, ' '), (err) => {
    if (err) throw err;
    console.log(`created: ${newFilePath}`);
  });
});
