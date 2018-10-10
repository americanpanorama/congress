const fs = require('fs');
const d3 = require('d3');

const elections = require('./elections/data/elections.json');

const counts = [];

// const getPartyCountForYearAndParty = (year, party) => (
//   Object.keys(elections[year]).reduce((accumulator, state) => (
//     accumulator + Object.keys(elections[year][state]).reduce((accumulator2, districtNum) => (
//       accumulator2 + ((elections[year][state][districtNum].partyReg === party) ? 1 : 0)
//     ), 0)
//   ), 0)
// );

const getPartyCountForYearAndParty = (year, party) => {
  let count = 0;
  Object.keys(elections[year]).forEach((s) => {
    Object.keys(elections[year][s]).forEach((d) => {
      if (d === 'GT' || d === 'AL') {
        elections[year][s][d].forEach((ald) => {
          if (ald.partyReg === party) {
            count += 1;
          }
        });
      } else if (elections[year][s][d].partyReg === party) {
        count += 1;
      }
    });
  });
  return count;
};

Object.keys(elections).forEach((year) => {
  if (year !== 'NaN' && parseInt(year) >= 1840) {
    const repCount = getPartyCountForYearAndParty(year, 'republican');
    const whigCount = getPartyCountForYearAndParty(year, 'whig');
    const demCount = getPartyCountForYearAndParty(year, 'democrat');
    const oppositionCount = getPartyCountForYearAndParty(year, 'opposition');
    const thirdCount = getPartyCountForYearAndParty(year, 'third');

    let demAboveMargin;
    if (parseInt(year) < 1854) {
      demAboveMargin = Math.max(demCount - whigCount, 0);
    } else if (parseInt(year) === 1854) {
      demAboveMargin = Math.max(demCount - oppositionCount - whigCount, 0);
      console.log(demAboveMargin);
    } else {
      demAboveMargin = Math.max(demCount - repCount, 0);
    }
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
      oppositionBelowMargin: oppositionCount,
      whigBelowMargin: whigBelowMargin,
      repBelowMargin: repBelowMargin,
      whigAboveMargin: whigAboveMargin,
      repAboveMargin: repAboveMargin
    });
  }
});

const stack = d3.stack()
  .keys(['demAboveMargin', 'demBelowMargin', 'thirdCount', 'whigBelowMargin', 'oppositionBelowMargin', 'repBelowMargin', 'whigAboveMargin', 'repAboveMargin']);

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
      whigBelowMargin,
      oppositionBelowMargin
    } = stackData.data;

    const formulas0 = {
      demAboveMargin: () => -1 * (demAboveMargin + demBelowMargin + thirdCount / 2),
      demBelowMargin: () => -1 * (demBelowMargin + thirdCount / 2),
      thirdCount: () => -1 * (thirdCount / 2),
      repBelowMargin: () => thirdCount / 2,
      whigBelowMargin: () => thirdCount / 2,
      oppositionBelowMargin: () => thirdCount / 2 + whigBelowMargin,
      repAboveMargin: () => 0,
      whigAboveMargin: () => 0
    };
    const formulas1 = {
      demAboveMargin: () => 0,
      demBelowMargin: () => -1 * (thirdCount / 2),
      thirdCount: () => thirdCount / 2,
      repBelowMargin: () => thirdCount / 2 + repBelowMargin,
      whigBelowMargin: () => thirdCount / 2 + whigBelowMargin,
      oppositionBelowMargin: () => thirdCount / 2 + whigBelowMargin + oppositionBelowMargin,
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

const repMajorityYears = stackedData[7]
  .filter(yd => yd.data.repAboveMargin > 0)
  .map(yd => yd.data.year);
const repStartYears = repMajorityYears
  .filter((year, i) => i === 0 || !repMajorityYears.includes(year - 2));
const repEndYears = repMajorityYears
  .filter((year, i) => i === repMajorityYears.length -1 || !repMajorityYears.includes(year + 2));
const repSpans = repStartYears.map((sy, i) => [sy, repEndYears[i]]);
const repSeries = [];
repSpans.forEach((span) => {
  const startIndex = stackedData[7].findIndex(yd => yd.data.year === span[0]);
  const endIndex = stackedData[7].findIndex(yd => yd.data.year === span[1]);
  const aRepSeries = stackedData[7].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
  repSeries.push(aRepSeries);
});

const whigMajorityYears = stackedData[6].filter(yd => yd.data.whigAboveMargin > 0).map(yd => yd.data.year);
const whigStartYears = whigMajorityYears.filter((year, i) => i === 0 || !whigMajorityYears.includes(year - 2));
const whigEndYears = whigMajorityYears.filter((year, i) => i === whigMajorityYears.length -1 || !whigMajorityYears.includes(year + 2));
const whigSpans = whigStartYears.map((sy, i) => [sy, whigEndYears[i]]);
const whigSeries = [];
whigSpans.forEach((span) => {
  const startIndex = stackedData[6].findIndex(yd => yd.data.year === span[0]);
  const endIndex = stackedData[6].findIndex(yd => yd.data.year === span[1]);
  const aWhigSeries = stackedData[6].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
  whigSeries.push(aWhigSeries);
});

// cut off the last two: 

stackedData.splice(6, 2);
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
partyCountsKeys.push('oppositionBelowMargin');
partyCountsKeys.push('repBelowMargin');

const maxDemocrats = Math.max(...counts.map(yd => yd.thirdCount / 2 + yd.demBelowMargin + yd.demAboveMargin));
const maxRepublicans = Math.max(...counts.map(yd => yd.thirdCount / 2 + yd.repBelowMargin + yd.repAboveMargin));

const x = d3.scaleLinear()
  .domain([1840, 2016])
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

// calculate and store party counts
const partyCountsProcessed = [];
counts.forEach((yearCount) => {
  partyCountsProcessed.push({
    year: yearCount.year,
    democrat: yearCount.demAboveMargin + yearCount.demBelowMargin,
    republican: yearCount.repAboveMargin + yearCount.repBelowMargin,
    whig: yearCount.whigAboveMargin + yearCount.whigBelowMargin,
    third: yearCount.thirdCount
  });
});

fs.writeFile('../data/partyCounts.json', JSON.stringify(partyCountsProcessed, null, ' '), (err) => {
  if (err) throw err;
  console.log('created partyCount file');
});
