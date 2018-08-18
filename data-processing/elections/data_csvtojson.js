const fs = require('fs');
const csv = require('csvtojson');
const parseFullName = require('parse-full-name').parseFullName;

const csvFilePath = './data/congressional_data.csv';

const raw_parties = require('./data/party_codebook.json');
const parties = {};
raw_parties.forEach(p => { 
  parties[p.party_id] = p.party;
});

const yearForCongress = function (congress) { return 1786 + congress * 2; };

const getRegularizedParty = function(party) { 
  party = (party) ? party.toLowerCase() : '';
  if (party.includes('whig')) {
    return 'whig';
  }
  if (party.startsWith('republican')) {
    return 'republican';
  }
  if (party.startsWith('democrat')) {
    return 'democrat';
  }
  if (party.includes('republican')) {
    return 'republican';
  }
  if (party.includes('democrat')) {
    return 'democrat';
  }
  return 'third';
  //return (party.toLowerCase().includes('republican')) ? 'republican' : (party.toLowerCase().includes('democrat')) ? 'democrat' : 'third'; 
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
    if (year && e.STATE && e.DISTRICT) {
      elections[year] = elections[year] || {};
      elections[year][e.STATE] = elections[year][e.STATE] || {};
      const electionData = {
        party_of_victory: parties[e.PARTY_OF_1],
        regularized_party_of_victory: getRegularizedParty(parties[e.PARTY_OF_1]),
        percent_vote: (e.TOTAL_VOTE && e.VICTOR_VOT) ? Math.round(parseInt(e.VICTOR_VOT) / parseInt(e.TOTAL_VOTE) * 10000) / 10000 : -1,
        victor: formatPersonName(e.VICTOR),
        id: (`000000${e.ID}`).slice(-12)
      };
      if (e.DISTRICT !== 'GT' && e.DISTRICT !== 'AL') {
        elections[year][e.STATE][e.DISTRICT] = electionData;
      } else {
        elections[year][e.STATE][e.DISTRICT] = elections[year][e.STATE][e.DISTRICT] || [];
        elections[year][e.STATE][e.DISTRICT].push(electionData);
      }
    }
  })
  .on('done', (err) => {
    fs.writeFile('./data/elections.json', JSON.stringify(elections), (err) => {
      if (err) throw err;
      console.log('COMPLETE--copy ./data-processing/elections/data.elections.json to ./data/elections.json');
    });
    fs.writeFile('../dorlings/data/elections.json', JSON.stringify(elections), (err) => {
      if (err) throw err;
      console.log('COMPLETE');
    });
  });
