const fs = require('fs');
const d3 = require('d3');

const elections = require('../data/elections.json');

const counts = [];

const getPartyCountForYearAndParty = (year, party) => (
  Object.keys(elections[year]).reduce((accumulator, state) => (
    accumulator + Object.keys(elections[year][state]).reduce((accumulator2, districtNum) => (
      accumulator2 + ((elections[year][state][districtNum].partyReg === party) ? 1 : 0) 
    ), 0)
  ), 0)
);

Object.keys(elections).forEach((year) => {
  if (year !== 'NaN') {
    const repCount = getPartyCountForYearAndParty(year, 'republican');
    const whigCount = getPartyCountForYearAndParty(year, 'whig');
    const demCount = getPartyCountForYearAndParty(year, 'democrat');
    const thirdCount = getPartyCountForYearAndParty(year, 'third');

    const demAboveMargin = (year < 1856) ? Math.max(demCount - whigCount, 0) :
      Math.max(demCount - repCount, 0);
    const demBelowMargin = (demAboveMargin <= 0) ? demCount : demCount - demAboveMargin;

    const repAboveMargin = Math.max(repCount - demCount, 0);
    const repBelowMargin = (repAboveMargin > 0) ? repCount - repAboveMargin : repCount;

    const whigAboveMargin = (whigCount > demCount) ? whigCount - demCount : 0;
    const whigBelowMargin = (whigAboveMargin > 0) ? whigCount - whigAboveMargin : whigCount;

    counts.push({
      year: parseInt(year),
      demAboveMargin: demAboveMargin,
      demBelowMargin: demBelowMargin,
      thirdCount: thirdCount,
      whigBelowMargin: whigBelowMargin,
      repBelowMargin: repBelowMargin,
      whigAboveMargin: whigAboveMargin,
      repAboveMargin: repAboveMargin
    });
  }
});

const stack = d3.stack()
  .keys(['demAboveMargin', 'demBelowMargin', 'thirdCount', 'whigBelowMargin', 'repBelowMargin', 'whigAboveMargin', 'repAboveMargin']);

// calculate preliminary steamgraph values
let stackedData = stack(counts);

// recalculate to offset democrats up and republicans and whigs down
stackedData.forEach((partyCounts, i) => {
  partyCounts.forEach((stackData, j) => {
    const {
      demAboveMargin,
      demBelowMargin,
      thirdCount,
      repAboveMargin,
      repBelowMargin,
      whigAboveMargin,
      whigBelowMargin
    } = stackData.data;

    const formulas0 = {
      demAboveMargin: () => -1 * (demAboveMargin + demBelowMargin + thirdCount / 2),
      demBelowMargin: () => -1 * (demBelowMargin + thirdCount / 2),
      thirdCount: () => -1 * (thirdCount / 2),
      repBelowMargin: () => thirdCount / 2,
      whigBelowMargin: () => thirdCount / 2,
      repAboveMargin: () => 0,
      whigAboveMargin: () => 0
    };
    const formulas1 = {
      demAboveMargin: () => 0,
      demBelowMargin: () => -1 * (thirdCount / 2),
      thirdCount: () => thirdCount / 2,
      repBelowMargin: () => thirdCount / 2 + repBelowMargin,
      whigBelowMargin: () => thirdCount / 2 + whigBelowMargin,
      repAboveMargin: () => thirdCount / 2 + repBelowMargin + repAboveMargin,
      whigAboveMargin: () => thirdCount / 2 + whigBelowMargin + whigAboveMargin
    };
    const coords = [formulas0[partyCounts.key](), formulas1[partyCounts.key]()];
    coords.data = stackData.data;
    stackedData[i][j] = coords;
  });
});

// split the margins into separate series
const demMajorityYears = stackedData[0]
  .filter(yd => yd.data.demAboveMargin > 0)
  .map(yd => yd.data.year);
const demStartYears = demMajorityYears
  .filter((year, i) => i === 0 || !demMajorityYears.includes(year - 2));
const demEndYears = demMajorityYears
  .filter((year, i) => i === demMajorityYears.length - 1 || !demMajorityYears.includes(year + 2));
const demSpans = demStartYears.map((sy, i) => [sy, demEndYears[i]]);
const demSeries = [];
demSpans.forEach((span) => {
  const startIndex = stackedData[0].findIndex(yd => yd.data.year === span[0]);
  const endIndex = stackedData[0].findIndex(yd => yd.data.year === span[1]);
  const aDemSeries = stackedData[0].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
  demSeries.push(aDemSeries);
});

const repMajorityYears = stackedData[6]
  .filter(yd => yd.data.repAboveMargin > 0)
  .map(yd => yd.data.year);
const repStartYears = repMajorityYears
  .filter((year, i) => i === 0 || !repMajorityYears.includes(year - 2));
const repEndYears = repMajorityYears
  .filter((year, i) => i === repMajorityYears.length -1 || !repMajorityYears.includes(year + 2));
const repSpans = repStartYears.map((sy, i) => [sy, repEndYears[i]]);
const repSeries = [];
repSpans.forEach((span) => {
  const startIndex = stackedData[6].findIndex(yd => yd.data.year === span[0]);
  const endIndex = stackedData[6].findIndex(yd => yd.data.year === span[1]);
  const aRepSeries = stackedData[6].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
  repSeries.push(aRepSeries);
});

const whigMajorityYears = stackedData[5].filter(yd => yd.data.whigAboveMargin > 0).map(yd => yd.data.year);
const whigStartYears = whigMajorityYears.filter((year, i) => i === 0 || !whigMajorityYears.includes(year - 2));
const whigEndYears = whigMajorityYears.filter((year, i) => i === whigMajorityYears.length -1 || !whigMajorityYears.includes(year + 2));
const whigSpans = whigStartYears.map((sy, i) => [sy, whigEndYears[i]]);
const whigSeries = [];
whigSpans.forEach((span) => {
  const startIndex = stackedData[5].findIndex(yd => yd.data.year === span[0]);
  const endIndex = stackedData[5].findIndex(yd => yd.data.year === span[1]);
  const aWhigSeries = stackedData[5].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
  whigSeries.push(aWhigSeries);
});

stackedData.splice(5, 2);
stackedData.splice(0, 1);
stackedData = repSeries.concat(stackedData);
stackedData = whigSeries.concat(stackedData);
stackedData = demSeries.concat(stackedData);
const partyCounts = stackedData;

const partyCountsKeys = [];
demSeries.forEach(ds => partyCountsKeys.push('demAboveMargin'));
whigSeries.forEach(ds => partyCountsKeys.push('whigAboveMargin'));
repSeries.forEach(ds => partyCountsKeys.push('repAboveMargin'));
partyCountsKeys.push('demBelowMargin');
partyCountsKeys.push('thirdCount');
partyCountsKeys.push('whigBelowMargin');
partyCountsKeys.push('repBelowMargin');

const maxDemocrats = Math.max(...counts.map(yd => yd.thirdCount / 2 + yd.demBelowMargin + yd.demAboveMargin));
const maxRepublicans = Math.max(...counts.map(yd => yd.thirdCount / 2 + yd.repBelowMargin + yd.repAboveMargin));

const x = d3.scaleLinear()
  .domain([1836, 2010])
  .range([0, 1]);
const y = d3.scaleLinear()
  .domain([-1 * maxDemocrats, maxRepublicans])
  .range([0, 1]);
const area = d3.area()
  .x(d => x(d.data.year))
  .y0(d => y(d[0]))
  .y1(d => y(d[1]))
  .curve(d3.curveCatmullRom);
const stackColor = {
  demAboveMargin: '#717EFF',
  demBelowMargin: '#E87E7F',
  thirdCount: '#D3C68B',
  repBelowMargin: '#E87E7F',
  repAboveMargin: '#FB6765',
  whigBelowMargin: '#F7845F',
  whigAboveMargin: '#F7845F'
};

const paths = [];
partyCounts.forEach((pathData, i) => {
  paths.push({
    d: area(pathData),
    party: partyCountsKeys[i],
    firstYear: pathData[0].data.year
  });
});

fs.writeFile('../data/steamgraphPaths.json', JSON.stringify(paths, null, ' '), (err) => {
  if (err) throw err;
  console.log('created steamgraph file');
});
