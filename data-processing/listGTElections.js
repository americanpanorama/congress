const d3 = require('d3');
const elections = require('./elections/data/elections.json');

const congressForYear = year => Math.round(d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year));
const gtElections = {};
Object.keys(elections).forEach((year) => {
  Object.keys(elections[year]).forEach((state) => {
    if (elections[year][state].GT) {
      gtElections[state] = gtElections[state] || [];
      gtElections[state].push(congressForYear(year));
    }
  });
});

console.log(gtElections);
