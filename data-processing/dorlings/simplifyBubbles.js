var fs = require('fs');

// load raw data files
const rawBubbles = require('./data/bubbleXYs.json'),
  precision = 1000;

let simplifiedBubbles = rawBubbles
  .map(yearData => ({
    year: yearData.year,
    districts: yearData.districts.map(district => ({
      id: district.id,
      district: district.district,
      x: Math.round(district.x * precision) / precision,
      y: Math.round(district.y * precision) / precision,
      xOrigin: Math.round(district.xOrigin * precision) / precision,
      yOrigin: Math.round(district.yOrigin * precision) / precision
    })),
    cities: yearData.cities.map(city => ({
      id: city.id,
      x: Math.round(city.x * precision) / precision,
      y: Math.round(city.y * precision) / precision,
      xOrigin: Math.round(city.xOrigin * precision) / precision,
      yOrigin: Math.round(city.yOrigin * precision) / precision,
      r: Math.round(city.r * precision) / precision
    }))
  }));

console.log(JSON.stringify(simplifiedBubbles));
