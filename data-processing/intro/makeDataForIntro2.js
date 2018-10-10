const fs = require('fs');
const data1976 = require('../../build/static/elections/1976.json');

const tennessee = data1976.elections.filter(e => e.state === 'TN');

fs.writeFileSync('../../data/introSelectedView.json', JSON.stringify(tennessee));
