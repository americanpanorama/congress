// queries carto to produce an object with years and states that require spatial mapping--i.e. that have different districts across election cycles
// inputs: none
// outputs: ./data/todDos.json

const d3 = require('d3');
const fs = require('fs');
const events = require('events');
const toSkip = require('./calculateYearsToSkip');
const states = require('./data/states.json');

const eventEmitter = new events.EventEmitter();

const yearsToSkip = toSkip.maybeToSkip();

const yearForCongress = function (congress) {
  return 1786 + congress * 2;
};
const getStateAbbr = function (state) {
  return states.find(s => s.state.toLowerCase() === state.toLowerCase()).postalCode;
};

d3.json('https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=select distinct (statename, endcong), endcong as congress, statename from districts order by congress, statename', (err, d) => {
  if (err) { console.log(err); }
  const toDos = {};
  d.rows.forEach((toDo) => {
    // skip years where there were at large districts usually avoiding redistricting
    if (!yearsToSkip[yearForCongress(toDo.congress)] || !yearsToSkip[yearForCongress(toDo.congress)].includes(getStateAbbr(toDo.statename))) {
      toDos[toDo.congress] = toDos[toDo.congress] || [];
      toDos[toDo.congress].push(toDo.statename);
    }

  });

  fs.writeFile('./data/toDos.json', JSON.stringify(toDos), (err2) => {
    if (err2) { return console.log(err2); }
    console.log('The file was saved!');
    eventEmitter.emit('toDosCompleted');
  });
});
