const fs = require('fs');

const unsimplifiedDir = '../districts/unsimplified-geojson/';
const simplifiedDir = '../districts/final-simplified-geojson/';

const yearForCongress = function (congress) { return 1786 + congress * 2; };

// count simplified districts
const simplifiedCounts = {};
const simplifiedFiles = fs.readdirSync(simplifiedDir);
simplifiedFiles.filter(f => f.slice(-5) === '.json' && parseInt(f.slice(0, -5)) >= 27)
  .forEach((f, i) => {
    console.log(`${simplifiedDir}${f}`);
    const congress = parseInt(f.slice(0, -5));
    const year = yearForCongress(congress);
    const count = JSON.parse(fs.readFileSync(`${simplifiedDir}${f}`, 'utf8')).features.length;

    simplifiedCounts[year] = {
      congress: congress,
      count: count
    };
  });

// count unsimplified districts
const unsimplifiedCounts = {};
const unsimplifiedFiles = fs.readdirSync(unsimplifiedDir);
unsimplifiedFiles.filter(f => f.slice(-5) === '.json' && f.slice(0, 4) === 'dist' && parseInt(f.slice(-8, -5)) >= 27)
  .forEach((f, i) => {
    const congress = parseInt(f.slice(-8, -5));
    const year = yearForCongress(congress);
    const count = JSON.parse(fs.readFileSync(`${unsimplifiedDir}${f}`, 'utf8')).features.length;

    unsimplifiedCounts[year] = {
      congress: congress,
      count: count
    };
  });

const comparison = {};
Object.keys(unsimplifiedCounts).forEach((y) => {
  comparison[y] = {
    congress: unsimplifiedCounts[y].congress,
    unsimplifiedCount: unsimplifiedCounts[y].count,
    difference: unsimplifiedCounts[y].count - simplifiedCounts[y].count
  };
});

console.log(comparison);
