const fs = require('fs');
const data2004 = require('../../build/static/elections/2004.json');

const florida = data2004.elections.filter(e => e.state === 'FL');

const floridaCities = data2004.cityBubbles.filter(c => c.id === 'Miami' || c.id === 'Tampa-St. Petersburg' || c.id === 'West Palm Beach');

const introMapCartogramData = {
  elections: florida,
  cityBubbles: floridaCities
};

const floridaPaths = florida.map(e => (`
  <path
    d='${e.svg}'
    stroke='white'
    stroke-width='0.0008'
    fill='${(e.partyReg === 'republican') ? '#FB6765' : '#717EFF'}'
  />
`));

const theMap = `
  <svg
    xmlns="http://www.w3.org/2000/svg" 
    version='1.1'
    width='150'
    height='150'
  >
    <g transform='translate(-120 -110) scale(1000)'>
      ${floridaPaths.join(' ')}
    </g>
  </svg>
`;

const floridaPathsObscured = florida.map(e => (`
  <path
    d='${e.svg}'
    stroke-width='0'
    fill='${(e.partyReg === 'republican') ? '#FB6765' : '#717EFF'}'
    fill-opacity='0.2'
  />
`));

const floridaBubbles = florida.map(e => (`
  <circle
    cx='${e.x}'
    cy='${e.y}'
    r='0.005'
    stroke-width='0'
    fill='${(e.partyReg === 'republican') ? '#FB6765' : '#717EFF'}'
  />
`));

const floridaCityBubbles = floridaCities.map(e => (`
  <circle
    cx='${e.x}'
    cy='${e.y}'
    r='${e.r}'
    stroke-width='0'
    fill='black'
    fill-opacity='0.4'
  />
`));

const theCartogram = `
  <svg
    xmlns="http://www.w3.org/2000/svg" 
    version='1.1'
    width='200'
    height='150'
  >
    <g transform='translate(-110 -110) scale(1000)'>
      ${floridaPathsObscured.join(' ')}
      ${floridaCityBubbles.join(' ')}
      ${floridaBubbles.join(' ')}
    </g>
  </svg>
`;

fs.writeFileSync('../../build/static/introImgs/num1Map.svg', theMap);
fs.writeFileSync('../../build/static/introImgs/num1Cartogram.svg', theCartogram);

fs.writeFileSync('../../data/introMapCartogram.json', JSON.stringify(introMapCartogramData));
