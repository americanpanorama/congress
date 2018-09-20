const fs = require('fs');
const d3 = require('d3');
const dissolve = require('geojson-dissolve');
const elections = require('../elections/data/elections.json');
const bubbles = require('../../data/bubbleXYs.json');
const spatialIds = require('../spatialIds/data/idMap.json');
const metroNames = require('../../data/metroNames.json');

const project = d3.geoPath(d3.geoAlbersUsa().scale(1).translate([0, 0]));
const yearForCongress = congress => 1786 + congress * 2;
const congressForYear = year => Math.round(d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year));

const processedData = {};

Object.keys(elections).forEach((year) => {
  const electionsPlus = [];
  const states = [];
  const filePath = `../../build/static/districts-geojson/${congressForYear(year)}.json`;
  const features = JSON.parse(fs.readFileSync(filePath, 'utf8')).features;

  const cityBubbles = bubbles.find(d => d.year === parseInt(year)).cities
    .map((c) => {
      c.id = metroNames[c.id.trim()];
      return c;
    });

  Object.keys(elections[year]).forEach((state) => {
    const bubblesForYear = bubbles.find(d => d.year === parseInt(year)).districts;
    const geojsonForState = [];
    Object.keys(elections[year][state]).forEach((districtType) => {
      if (districtType === 'GT' || districtType === 'AL') {
        elections[year][state][districtType].forEach((alDistrict, i) => {
          const electionPlus = alDistrict;
          const districtId = electionPlus.id;
          const id = `${electionPlus.id}-${i}`;
          electionPlus.id = id;
          electionPlus.districtType = districtType;
          electionPlus.onlyAL = elections[year][state][districtType].length === 1;

          // single AL districts use the districtId, multiple AL districts and all GT elections use the spatialId
          const theId = (electionPlus.onlyAL) ? districtId : id;

          // if (state === 'WY') {
          //   console.log(electionPlus);
          //   console.log(districtId, id, theId);
          // }

          // get the spatialId
          if (spatialIds[year][theId]) {
            electionPlus.spatialId = parseInt(spatialIds[year][theId].slice(9));

            // get the bubble coords
            const bubbleForDistrict = bubblesForYear.find(d => d.id === id);
            const {
              x,
              y,
              xOrigin,
              yOrigin
            } = bubbleForDistrict;
            const stateAbbr = bubbleForDistrict.district.slice(0, 2);

            electionPlus.x = x;
            electionPlus.y = y;
            electionPlus.xOrigin = xOrigin;
            electionPlus.yOrigin = yOrigin;
            electionPlus.state = stateAbbr;

            // get the spatial data
            const feature = features.find(d => d.properties.id === districtId);

            if (feature) {
              const theGeojson = features.find(d => d.properties.id === districtId).geometry;
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
        const { id } = electionPlus;
        electionPlus.districtType = districtType;

        // get the spatialId
        electionPlus.spatialId = (spatialIds[year][id]) ? parseInt(spatialIds[year][id].slice(9)) : -1;

        // get the bubble coords
        const bubbleForDistrict = bubblesForYear.find(d => d.id === id);
        const {
          x,
          y,
          xOrigin,
          yOrigin
        } = bubbleForDistrict;
        const stateAbbr = bubbleForDistrict.district.slice(0, 2);

        electionPlus.x = x;
        electionPlus.y = y;
        electionPlus.xOrigin = xOrigin;
        electionPlus.yOrigin = yOrigin;
        electionPlus.state = stateAbbr;

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
        const priorElections = processedData[year - 2];
        if (priorElections) {
          const priorElection = priorElections.find(e => e.spatialId === electionPlus.spatialId);
          if (priorElection && priorElection.partyReg !== electionPlus.partyReg) {
            flipped = true;
          }
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
