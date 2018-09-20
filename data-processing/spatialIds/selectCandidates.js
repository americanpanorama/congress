const fs = require('fs');
const preliminaryMapping = require('./data/preliminaryMapping.json');
const candidates = require('./data/candidates2.json');
const exceptionsCandidates = require('./data/candidatesExceptions.json');

const mapping = preliminaryMapping;
const thecandidates = candidates.concat(exceptionsCandidates);

// iterate through preliminary mapping filling in gaps from the candidates
Object.keys(mapping).forEach((y) => {
  const year = parseInt(y);
  Object.keys(mapping[y]).forEach((state) => {
    Object.keys(mapping[y][state]).forEach((district) => {
      // try to fill it in if it's blank
      if (!mapping[y][state][district]) {
        const selectedI = thecandidates.findIndex(c => c.previousdistrict === district && c.fromyear === year);
        if (district === '051063072008') {
          console.log(selectedI, thecandidates[selectedI]);
        }
        if (selectedI > -1) {
          //console.log(`mapped ${thecandidates[selectedI].previousdistrict} to ${thecandidates[selectedI].nextdistrict}`);
          mapping[y][state][district] = thecandidates[selectedI].nextdistrict;
          // remove that selections as it's no longer a candidate
          thecandidates.splice(selectedI, 1);
        } else {
          //console.log(`no candidate for ${district}`);
        }
      }
    });
  });
});

fs.writeFile('./data/secondMapping.json', JSON.stringify(mapping), (err2) => {
  if (err2) { return console.log(err); }
  console.log('The file was saved!');
});
