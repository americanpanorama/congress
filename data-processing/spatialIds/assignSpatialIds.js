// takes the final mapping and iterates through it to assign spatial ids to each district
// inputs ./data/mapping.json produced by ./makeFinalMapping.js
// outputs ./data/spatialIds.json

const fs = require('fs');
const mapping = require('./data/secondMapping.json');
const elections = require('../elections/data/elections.json');

const stateAbbrs = [{ state: 'Alabama', abbreviation: 'Ala.', postalCode: 'AL', fips: '001' }, { state: 'Alaska', abbreviation: 'Alaska', postalCode: 'AK', fips: '002' }, { state: 'Arizona', abbreviation: 'Ariz.', postalCode: 'AZ', fips: '004' }, { state: 'Arkansas', abbreviation: 'Ark.', postalCode: 'AR', fips: '005' }, { state: 'California', abbreviation: 'Calif.', postalCode: 'CA', fips: '006' }, { state: 'Colorado', abbreviation: 'Colo.', postalCode: 'CO', fips: '008' }, { state: 'Connecticut', abbreviation: 'Conn.', postalCode: 'CT', fips: '009' }, { state: 'Delaware', abbreviation: 'Del.', postalCode: 'DE', fips: '010' }, { state: 'District of Columbia', abbreviation: 'D.C.', postalCode: 'DC', fips: '011' }, { state: 'Florida', abbreviation: 'Fla.', postalCode: 'FL', fips: '012' }, { state: 'Georgia', abbreviation: 'Ga.', postalCode: 'GA', fips: '013' }, { state: 'Guam', abbreviation: 'Guam', postalCode: 'GU', fips: '014' }, { state: 'Hawaii', abbreviation: 'Hawaii', postalCode: 'HI', fips: '015' }, { state: 'Idaho', abbreviation: 'Idaho', postalCode: 'ID', fips: '016' }, { state: 'Illinois', abbreviation: 'Ill.', postalCode: 'IL', fips: '017' }, { state: 'Indiana', abbreviation: 'Ind.', postalCode: 'IN', fips: '018' }, { state: 'Iowa', abbreviation: 'Iowa', postalCode: 'IA', fips: '019' }, { state: 'Kansas', abbreviation: 'Kans.', postalCode: 'KS', fips: '020' }, { state: 'Kentucky', abbreviation: 'Ky.', postalCode: 'KY', fips: '021' }, { state: 'Louisiana', abbreviation: 'La.', postalCode: 'LA', fips: '022' }, { state: 'Maine', abbreviation: 'Maine', postalCode: 'ME', fips: '023' }, { state: 'Maryland', abbreviation: 'Md.', postalCode: 'MD', fips: '024' }, { state: 'Massachusetts', abbreviation: 'Mass.', postalCode: 'MA', fips: '025' }, { state: 'Michigan', abbreviation: 'Mich.', postalCode: 'MI', fips: '026' }, { state: 'Minnesota', abbreviation: 'Minn.', postalCode: 'MN', fips: '027' }, { state: 'Mississippi', abbreviation: 'Miss.', postalCode: 'MS', fips: '028' }, { state: 'Missouri', abbreviation: 'Mo.', postalCode: 'MO', fips: '029' }, { state: 'Montana', abbreviation: 'Mont.', postalCode: 'MT', fips: '030' }, { state: 'Nebraska', abbreviation: 'Nebr.', postalCode: 'NE', fips: '031' }, { state: 'Nevada', abbreviation: 'Nev.', postalCode: 'NV', fips: '032' }, { state: 'New Hampshire', abbreviation: 'N.H.', postalCode: 'NH', fips: '033' }, { state: 'New Jersey', abbreviation: 'N.J.', postalCode: 'NJ', fips: '034' }, { state: 'New Mexico', abbreviation: 'N.M.', postalCode: 'NM', fips: '035' }, { state: 'New York', abbreviation: 'N.Y.', postalCode: 'NY', fips: '036' }, { state: 'North Carolina', abbreviation: 'N.C.', postalCode: 'NC', fips: '037' }, { state: 'North Dakota', abbreviation: 'N.D.', postalCode: 'ND', fips: '038' }, { state: 'Ohio', abbreviation: 'Ohio', postalCode: 'OH', fips: '039' }, { state: 'Oklahoma', abbreviation: 'Okla.', postalCode: 'OK', fips: '040' }, { state: 'Oregon', abbreviation: 'Ore.', postalCode: 'OR', fips: '041' }, { state: 'Pennsylvania', abbreviation: 'Pa.', postalCode: 'PA', fips: '042' }, { state: 'Puerto Rico', abbreviation: 'P.R.', postalCode: 'PR', fips: '043' }, { state: 'Rhode Island', abbreviation: 'R.I.', postalCode: 'RI', fips: '044' }, { state: 'South Carolina', abbreviation: 'S.C.', postalCode: 'SC', fips: '045' }, { state: 'South Dakota', abbreviation: 'S.D.', postalCode: 'SD', fips: '046' }, { state: 'Tennessee', abbreviation: 'Tenn.', postalCode: 'TN', fips: '047' }, { state: 'Texas', abbreviation: 'Tex.', postalCode: 'TX', fips: '048' }, { state: 'Utah', abbreviation: 'Utah', postalCode: 'UT', fips: '049' }, { state: 'Vermont', abbreviation: 'Vt.', postalCode: 'VT', fips: '050' }, { state: 'Virginia', abbreviation: 'Va.', postalCode: 'VA', fips: '051' }, { state: 'Virgin Islands', abbreviation: 'V.I.', postalCode: 'VI', fips: '052' }, { state: 'Washington', abbreviation: 'Wash.', postalCode: 'WA', fips: '053' }, { state: 'West Virginia', abbreviation: 'W.Va.', postalCode: 'WV', fips: '054' }, { state: 'Wisconsin', abbreviation: 'Wis.', postalCode: 'WI', fips: '055' }, { state: 'Wyoming', abbreviation: 'Wyo.', postalCode: 'WY', fips: '056' } ];
const getStateAbbr = function (state) {
  return stateAbbrs.find(s => s.state.toLowerCase() === state.toLowerCase()).postalCode;
};

let spatialId = 0;
const spatialIds = {};

// initialize with the first congress's data
console.log('initializing for 1788');
Object.keys(mapping['1788']).forEach((state) => {
  Object.keys(mapping['1788'][state]).forEach((currentDistrict) => {
    spatialIds[`spatialId${spatialId}`] = { 1788: currentDistrict};
    if (mapping['1788'][state][currentDistrict]) {
      spatialIds[`spatialId${spatialId}`]['1790'] = mapping['1788'][state][currentDistrict];
    }
    spatialId += 1;
  });
});
delete mapping['1788'];

Object.keys(mapping)
  .map(year => parseInt(year))
  .sort((a, b) => a - b)
  .forEach((year) => {
    console.log('processing mapping for ' + year);

    Object.keys(mapping[year]).forEach((state) => {
      Object.keys(mapping[year][state]).forEach((currentDistrict) => {
        const nextDistrict = mapping[year][state][currentDistrict];
        const stateAbbr = getStateAbbr(state);
        // see if it's a general ticket election
        if (elections[year] && elections[year][stateAbbr] && elections[year][stateAbbr].GT && currentDistrict.slice(-3) === '000') {
          // assign a spatial id for each
          elections[year][stateAbbr].GT.forEach((gtElection, i) => {
            const newId = `spatialId${spatialId}`;
            spatialIds[newId] = {};
            spatialIds[newId][year] = `${currentDistrict}-${i}`;
            spatialId += 1;
          });
        } else {
          // check to see if you there's a match in a previous congress
          let previousSpatialId = false;
          Object.keys(spatialIds).forEach((aSpatialId) => {
            if (spatialIds[aSpatialId][year] && spatialIds[aSpatialId][year] === currentDistrict) {
              previousSpatialId = true;
              // find the next year and add it if there's a mapping
              if (nextDistrict) {
                // find it
                const nextYear = parseInt(Object.keys(mapping)
                  .filter(y => parseInt(y) > year)
                  .sort((a, b) => a - b)
                  .filter(futureYear => (mapping[futureYear] && mapping[futureYear][state]
                    && mapping[futureYear][state][nextDistrict]))[0]);
                if (nextYear) {
                  spatialIds[aSpatialId][nextYear] = nextDistrict;
                }
              }
            }
          });
          // create a new spatialId
          if (!previousSpatialId) {
            const newId = `spatialId${spatialId}`;
            spatialIds[newId] = {};
            spatialIds[newId][year] = currentDistrict;
            if (nextDistrict) {
              // find it
              const nextYear = parseInt(Object.keys(mapping)
                .filter(y => parseInt(y) > year)
                .sort((a, b) => a - b)
                .filter(futureYear => (mapping[futureYear] && mapping[futureYear][state]
                  && mapping[futureYear][state][nextDistrict]))[0]);
              if (nextYear) {
                spatialIds[newId][nextYear] = nextDistrict;
              }
            }
            spatialId += 1;
          }
        }
      });
    });
  });

fs.writeFile("./data/spatialIds.json", JSON.stringify(spatialIds), function(err) {
    if(err) { return console.log(err); }
    console.log("spatialIds file was saved!");
}); 
