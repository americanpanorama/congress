const elections = require('./data/elections.json');

// drop districts that aren't at large
const atLarge = {};
Object.keys(elections).forEach((year) => {
  Object.keys(elections[year]).forEach((state) => {
    if (Object.keys(elections[year][state]).includes('0')) {
      atLarge[year] = atLarge[year] || [];
      atLarge[year].push(state);
    }
  });
});

// go through the states with at large elections and drop those that persist across subsequent elections
Object.keys(atLarge).forEach((year) => {
  atLarge[year].forEach((state) => {
    if (atLarge[parseInt(year) + 2] && atLarge[parseInt(year) + 2].includes(state)) {
      // keep removing the state until you don't find it in an election
      let removing = true;
      let yearToRemove = parseInt(year);
      while (removing) {
        atLarge[yearToRemove] = atLarge[yearToRemove].filter(s => s !== state && s !== 'DC');
        yearToRemove += 2;
        removing = !atLarge[yearToRemove].includes(state);
      }
    }
  });
  if (atLarge[year].length === 0) {
    delete (atLarge[year]);
  }
});

// go back through this list and eliminate states that have multiple districts for that year
Object.keys(atLarge).forEach((year) => {
  atLarge[year].forEach((state) => {
    if (Object.keys(elections[year][state]).length > 1) {
      atLarge[year] = atLarge[year].filter(s => s !== state);
    }
  });
  if (atLarge[year].length === 0) {
    delete (atLarge[year]);
  }
});

exports.maybeToSkip = () => atLarge;
