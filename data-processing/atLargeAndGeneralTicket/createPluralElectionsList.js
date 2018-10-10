const fs = require('fs');
const elections = require('../elections/data/elections.json');

const pluralDistricts = {};
Object.keys(elections).forEach((year) => {
  if (parseInt(year) <= 1840) {
    Object.keys(elections[year]).forEach((state) => {
      // look for plural elections
      Object.keys(elections[year][state]).forEach((d) => {
        if (elections[year][state][d].plural) {
          pluralDistricts[year] = pluralDistricts[year] || {};
          pluralDistricts[year][elections[year][state][d].id] = elections[year][state][d].plural;
        }
      });
    });
  }
});

fs.writeFile("./data/pluralDistricts.json", JSON.stringify(pluralDistricts), function (err) {
  if(err) { return console.log(err); }
  console.log("The file was saved!");
}); 
