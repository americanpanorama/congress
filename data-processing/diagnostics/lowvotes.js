const elections = require('../elections/data/elections.json');

const toCheck = [];
Object.keys(elections).forEach((y) => {
  Object.keys(elections[y]).forEach((s) => {
    Object.keys(elections[y][s]).forEach((d) => {
      if (d !== 'GT' && d !== 'AL' && elections[y][s][d].percent <= 0.4 && elections[y][s][d].percent >= 0.01) {
        elections[y][s][d].year = y;
        elections[y][s][d].state = s;
        toCheck.push(elections[y][s][d]);
      }
    });
  });
});

toCheck.sort((a, b) => b.year - a.year);

const lis = toCheck.map(d => `${d.year} ${d.state} ${d.id.slice(-2)} ${d.partyReg} ${d.percent} ${d.victor}`);
console.log(JSON.stringify(lis));
