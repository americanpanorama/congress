const fs = require('fs');
const csv = require('csvtojson');
const parseFullName = require('parse-full-name').parseFullName;

const csvFilePath = './data/congressional_data.csv';

const rawParties = require('./data/party_codebook.json');
const parties = {};
rawParties.forEach(p => { 
  parties[p.party_id] = p.party;
});

const yearForCongress = function (congress) { return 1786 + congress * 2; };

const getRegularizedParty = function (party, year) {
  party = (party) ? party.toLowerCase() : '';
  if (party.includes('whig')) {
    return 'whig';
  }
  if (party.startsWith('repub')) {
    return 'republican';
  }
  if (party.startsWith('democrat')) {
    return 'democrat';
  }
  if (party.includes('repub')) {
    return 'republican';
  }
  if (party.includes('democrat')) {
    return 'democrat';
  }
  if (party.includes('opposition') && year === 1854) {
    return 'opposition';
  }
  return 'third';
};

const formatPersonName = function (name) {
  let formattedName;
  if (name.split(',').length <= 2) {
    let {
      first,
      middle,
      last,
      suffix
    } = parseFullName(name);
    if (middle === middle.toLowerCase()) {
      middle = `${middle.charAt(0).toUpperCase()}${middle.slice(1)}`;
    }
    formattedName = [first, middle, last, suffix].join(' ');
  }
  return (formattedName) ? formattedName.replace(/\s+/g, ' ') : name.replace(/\s+/g, ' ');
};

const elections = {};
csv()
  .fromFile(csvFilePath)
  .on('error', (err) => {
    console.log(err);
  })
  .on('json', (e) => {
    const year = yearForCongress(e.CONGRESS);
    if (year && year >= 1840 && e.STATE && e.DISTRICT) {
      elections[year] = elections[year] || {};
      elections[year][e.STATE] = elections[year][e.STATE] || {};

      let percent = -1;
      if (e.VICTOR_VOT === -9) {
        percent = 1;
      } else if (e.TOTAL_VOTE && e.VICTOR_VOT) {
        percent = Math.round(parseInt(e.VICTOR_VOT) / parseInt(e.TOTAL_VOTE) * 1000) / 1000;
      }
      const electionData = {
        party: parties[e.PARTY_OF_1],
        partyReg: getRegularizedParty(parties[e.PARTY_OF_1], year),
        percent: percent,
        victor: formatPersonName(e.VICTOR).trim(),
        id: (`000000${e.ID}`).slice(-12),
        plural: (e.Plural) ? parseInt(e.Plural) : false
      };
      if (e.DISTRICT !== 'GT' && e.DISTRICT !== 'AL' && e.DISTRICT !== '0') {
        elections[year][e.STATE][e.DISTRICT] = electionData;
      } else {
        const districtType = (e.DISTRICT === '0') ? 'AL' : e.DISTRICT;
        elections[year][e.STATE][districtType] = elections[year][e.STATE][districtType] || [];
        elections[year][e.STATE][districtType].push(electionData);
      }
    }
  })
  .on('done', (err) => {
    if (err) { console.warn(err); }
    fs.writeFile('./data/elections.json', JSON.stringify(elections), (err) => {
      if (err) throw err;
      console.log('COMPLETE--copy ./data-processing/elections/data.elections.json to ./data/elections.json');
    });
    fs.writeFile('../dorlings/data/elections.json', JSON.stringify(elections), (err) => {
      if (err) throw err;
      console.log('COMPLETE');
    });
  });
