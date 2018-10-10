const fs = require('fs');
const elections = require('../elections/data/elections.json');

const ALsAndGTs = {};
Object.keys(elections).forEach((year) => {
  Object.keys(elections[year]).forEach((state) => {
    if (elections[year][state].AL || elections[year][state].GT) {
      const ALs = (elections[year][state].AL) ? elections[year][state].AL.length : 0;
      const GTs = (elections[year][state].GT) ? elections[year][state].GT.length : 0;
      const id = (elections[year][state].AL) ? elections[year][state].AL[0].id
        : elections[year][state].GT[0].id;
      ALsAndGTs[id] = ALsAndGTs[id] || { state: state, elections: {} };
      ALsAndGTs[id].elections[year] = ALs + GTs;
    }
  });
});

fs.writeFile("./data/alAndgts.json", JSON.stringify(ALsAndGTs), function(err) {
  if(err) { return console.log(err); }
  console.log("The file was saved!");
}); 
