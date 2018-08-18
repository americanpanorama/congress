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

var elections = [];
csv()
	.fromFile(csvFilePath)
	.on('json',(e)=>{
		const year = yearForCongress(e.CONGRESS);
		if (year && e.STATE && e.DISTRICT) {
			elections.push(e);
		}
	})
	.on('done',(error)=>{
		console.log(JSON.stringify(elections));
	});
