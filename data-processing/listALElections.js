const d3 = require('d3');
const elections = require('./elections/data/elections.json');

const congressForYear = year => Math.round(d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year));
const alElections = {};
Object.keys(elections).forEach((year) => {
  Object.keys(elections[year]).forEach((state) => {
    if (elections[year][state].AL && Object.keys(elections[year][state]).length === 1) {
      alElections[state] = alElections[state] || [];
      alElections[state].push(parseInt(year));
    }
  });
});

Object.keys(alElections).forEach((state) => {
  let output = `${state}:`;
  alElections[state].forEach((year, i) => {
    if (i === 0 || !alElections[state].includes(year - 2)) {
      output = `${output} ${year}-`;
    } else if (i === alElections[state].length - 1 || !alElections[state].includes(year + 2)) {
      output = `${output}${year} `;
    }
  });

  const ids = alElections[state]
    .map(year => elections[year][state].AL[0].id)
    .filter((v, i, a) => a.indexOf(v) === i);

  output = `${output} (${ids.join(', ')})`;

  console.log(output);
});

const multipleALElections = {};
Object.keys(elections).forEach((year) => {
  Object.keys(elections[year]).forEach((state) => {
    if (elections[year][state].AL && elections[year][state].AL.length > 1) {
      multipleALElections[year] = multipleALElections[year] || {};
      multipleALElections[year][state] = elections[year][state].AL.length;
    }
  });
});

console.log(JSON.stringify(multipleALElections));
