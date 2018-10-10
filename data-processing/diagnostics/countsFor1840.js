const csv = require('csvtojson');

const e1840 = [];
const byState = {};
csv()
  .fromFile('../elections/data/congressional_data.csv')
  .on('error', (err) => {
    console.log(err);
  })
  .on('json', (e) => {
    if (e.CONGRESS === '28') {
      e1840.push(e);
    }
  })
  .on('done', (err) => {
    console.log(e1840.length);
    e1840.forEach((e) => {
      byState[e.STATE] = byState[e.STATE] || 0;
      byState[e.STATE] += 1;
    });
    Object.keys(byState)
      .sort()
      .forEach(s => console.log(`${s}: ${byState[s]}`))
  });
