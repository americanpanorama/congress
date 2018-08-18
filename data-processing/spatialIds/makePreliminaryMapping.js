// queries carto to produce a preliminary mapping of districts across time--i.e. districts that persist across more than one election cycle are mapped to each other; if they don't a null placeholder is entered to be mapped in SOMEFILE 

const yearsToSkip = require('./calculateYearsToSkip.js');
const d3 = require('d3');
const fs = require('fs');

const baseUrlJson = 'https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=';
const queryAllDistricts = 'SELECT distinct on (id) id, statename, district, startcong, endcong FROM districts';

const yearForCongress = congress => 1786 + congress * 2;

const mapping = [];
const mappingObject = {};

d3.json(baseUrlJson + queryAllDistricts, (err, d) => {
  if (err) { return console.log(err); }
  // obviously, if the district spans multiple years/congresses, the mapping is to itself
  d.rows.forEach((district) => {
    for (let congress = district.startcong; congress <= district.endcong; congress++) {
      mapping.push({
        congress: congress,
        state: district.statename,
        id: district.id,
        mapToId: (district.endcong > congress) ? district.id : null
      });
    }
  });
  mapping.sort((a, b) => {
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
  mapping.forEach((d2) => {
    mappingObject[yearForCongress(d2.congress)] = mappingObject[yearForCongress(d2.congress)] || {};
    mappingObject[yearForCongress(d2.congress)][d2.state] = mappingObject[yearForCongress(d2.congress)][d2.state] || {};
    mappingObject[yearForCongress(d2.congress)][d2.state][d2.id] = d2.mapToId;
  });
  fs.writeFile('./data/preliminaryMapping.json', JSON.stringify(mappingObject), (err2) => {
    if (err2) { return console.log(err); }
    console.log('The file was saved!');
  });
});
