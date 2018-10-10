const fs = require('fs');

const steamgraphPaths = require('../../data/steamgraphPaths.json');

const stackColor = {
  demAboveMargin: '#717EFF',
  demBelowMargin: '#9198DF',
  thirdCount: '#D4C685',
  oppositionBelowMargin: '#7851a9',
  repBelowMargin: '#D68E8A',
  repAboveMargin: '#FB6765',
  whigBelowMargin: '#DA9B81',
  whigAboveMargin: '#FF7F50'
};

const xSpacing = 15;
const height = 70;

const thePaths = steamgraphPaths
  .map((p, i) => {
    return (`
      <path
        d='${p.d}'
        fill='${stackColor[p.party]}'
        stroke-opacity='0'
      />
    `);
  });

const theImage = `
  <svg
    xmlns="http://www.w3.org/2000/svg" 
    version='1.1'
    width='225'
    height='${height + 20}'
  >
    <defs>
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Saira+Condensed:100');
     </style>
    </defs>
    <g transform='translate(-400) scale(800 70)'>
      ${thePaths.join(' ')}
    </g>
    <line
      x1='${15 * xSpacing - 20}'
      x2='${15 * xSpacing - 20}'
      y1='0'
      y2='${height}'
      stroke='#F0B67F'
      stroke-width='1'
    />
    <text
      x='${15 * xSpacing - 20}'
      y='${height + 15}'
      text-anchor='middle'
      fill='#F0B67F'
      style='font-family: "Saira Condensed";'
    >
      1982
    </text>

  </svg>
`;

fs.writeFileSync('../../build/static/introImgs/num3Timeline.svg', theImage);
