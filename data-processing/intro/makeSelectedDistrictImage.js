const fs = require('fs');
const d3 = require('d3');

const aDistrict = require('../../build/static/space-data/975.json');

const aDistrictSelection = aDistrict.filter(e => e.year >= 1965 && e.year <= 2000);

const xSpacing = 15;
const height = 70;

const line = d3.line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(d3.curveCatmullRom);

const lineData = aDistrictSelection.map((e, i) => {
  let y;
  if (e.partyReg === 'democrat') {
    y = height / 2 - e.percent * height / 2;
  } else {
    y = height / 2 + e.percent * height / 2;
  }
  return { x: i * xSpacing - 20, y: y };
});

const theCircles = aDistrictSelection.map((e, i) => {
  let y;
  if (e.partyReg === 'democrat') {
    y = height / 2 - e.percent * height / 2;
  } else {
    y = height / 2 + e.percent * height / 2;
  }
  return (`
    <circle
      cx='${i * xSpacing - 20}'
      cy='${y}'
      r='4'
      fill='${(e.partyReg === 'republican') ? '#FB6765' : '#717EFF'}'
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
    <rect width='225' height='${height / 2}' fill='#717EFF' fill-opacity='0.1' />
    <rect y='${height / 2}' width='225' height='${height / 2}' fill='#FB6765' fill-opacity='0.1' />
    <path
      d='${line(lineData)}'
      stroke='white'
      strokeWidth='2'
      fill='transparent'
    />
    <line
      x1='${5 * xSpacing - 20}'
      x2='${5 * xSpacing - 20}'
      y1='0'
      y2='${height}'
      stroke='#F0B67F'
      stroke-width='1'
    />
    <text
      x='${5 * xSpacing - 20}'
      y='${height + 15}'
      text-anchor='middle'
      fill='#F0B67F'
      style='font-family: "Saira Condensed";'
    >
      1888
    </text>
  ${theCircles.join(' ')}
  </svg>
`;

fs.writeFileSync('../../build/static/introImgs/num4Selected.svg', theImage);
