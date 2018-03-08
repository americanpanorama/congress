const csvFilePath='./raw-data/congressional_data.csv';
const csv=require('csvtojson');

const raw_parties = require('./raw-data/party_codebook.json');
var parties = {};
raw_parties.forEach(p => parties[p.party_id] = p.party );

yearForCongress = function (congress) { return 1786 + congress * 2; };

const getRegularizedParty = function(party) { 
  party = party || '';
  return (party.toLowerCase().includes('republican')) ? 'republican' : (party.toLowerCase().includes('democrat')) ? 'democrat' : 'third'; 
};

var elections = {};
csv()
	.fromFile(csvFilePath)
	.on('json',(e)=>{
		const year = yearForCongress(e.CONGRESS);
		elections[year] = elections[year] || {};
		elections[year][e.STATE] = elections[year][e.STATE] || {};
		elections[year][e.STATE][e.DISTRICT] = {
			party_of_victory: parties[e.PARTY_OF_1],
			regularized_party_of_victory: getRegularizedParty(parties[e.PARTY_OF_1]),
			percent_vote: (e.TOTAL_VOTE && e.VICTOR_VOT) ?  Math.round(parseInt(e.VICTOR_VOT) / parseInt(e.TOTAL_VOTE) * 10000)/10000 : -1,
			victor: e.VICTOR
		};
	})
	.on('done',(error)=>{
		delete elections['1000'];
		console.log(JSON.stringify(elections));
	});
