// queries carto to produce a preliminary mapping of districts across time--i.e. districts that persist across more than one election cycle are mapped to each other; if they don't a null placeholder is entered to be mapped in SOMEFILE 

const d3 = require("d3"),  
  fs = require('fs');

const baseUrlJson = "https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=",
  queryAllDistricts = "SELECT distinct on (id) id, statename, district, startcong, endcong FROM districts";

const yearForCongress = function (congress) { return 1786 + congress * 2; },
  congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

var mapping = [],
  mappingObject = {};
d3.json(baseUrlJson + queryAllDistricts, (err, d) => {
  // obviously, if the district spans multiple years/congresses, the mapping is to itself
  d.rows.forEach(district => {
    for (let congress = district.startcong; congress <= district.endcong; congress++) {
      mapping.push({
        congress: congress,
        state: district.statename,
        id: district.id,
        mapToId: (district.endcong > congress) ? district.id : null
      });
    }
  });
  mapping.sort((a,b) => {
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
  mapping.forEach(d => {
    mappingObject[yearForCongress(d.congress)] = mappingObject[yearForCongress(d.congress)] || {};
    mappingObject[yearForCongress(d.congress)][d.state] = mappingObject[yearForCongress(d.congress)][d.state] || {};
    mappingObject[yearForCongress(d.congress)][d.state][d.id] = d.mapToId;
  });
  fs.writeFile("./data/preliminaryMapping.json", JSON.stringify(mappingObject), function(err) {
      if(err) { return console.log(err); }
      console.log("The file was saved!");
  }); 
});