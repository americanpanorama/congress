var fs = require('fs'),
  d3 = require("d3");

// load raw data files and initialize
const raw_elections = require('./data/elections.json'),
	raw_parties = require('./data/party_codebook.json'),
	elections = {},
	namesAndAbbrs = [{"name": "Alabama", "abbreviation": "AL"}, {"name": "Alaska", "abbreviation": "AK"}, {"name": "American Samoa", "abbreviation": "AS"}, {"name": "Arizona", "abbreviation": "AZ"}, {"name": "Arkansas", "abbreviation": "AR"}, {"name": "California", "abbreviation": "CA"}, {"name": "Colorado", "abbreviation": "CO"}, {"name": "Connecticut", "abbreviation": "CT"}, {"name": "Delaware", "abbreviation": "DE"}, {"name": "District Of Columbia", "abbreviation": "DC"}, {"name": "Federated States Of Micronesia", "abbreviation": "FM"}, {"name": "Florida", "abbreviation": "FL"}, {"name": "Georgia", "abbreviation": "GA"}, {"name": "Guam", "abbreviation": "GU"}, {"name": "Hawaii", "abbreviation": "HI"}, {"name": "Idaho", "abbreviation": "ID"}, {"name": "Illinois", "abbreviation": "IL"}, {"name": "Indiana", "abbreviation": "IN"}, {"name": "Iowa", "abbreviation": "IA"}, {"name": "Kansas", "abbreviation": "KS"}, {"name": "Kentucky", "abbreviation": "KY"}, {"name": "Louisiana", "abbreviation": "LA"}, {"name": "Maine", "abbreviation": "ME"}, {"name": "Marshall Islands", "abbreviation": "MH"}, {"name": "Maryland", "abbreviation": "MD"}, {"name": "Massachusetts", "abbreviation": "MA"}, {"name": "Michigan", "abbreviation": "MI"}, {"name": "Minnesota", "abbreviation": "MN"}, {"name": "Mississippi", "abbreviation": "MS"}, {"name": "Missouri", "abbreviation": "MO"}, {"name": "Montana", "abbreviation": "MT"}, {"name": "Nebraska", "abbreviation": "NE"}, {"name": "Nevada", "abbreviation": "NV"}, {"name": "New Hampshire", "abbreviation": "NH"}, {"name": "New Jersey", "abbreviation": "NJ"}, {"name": "New Mexico", "abbreviation": "NM"}, {"name": "New York", "abbreviation": "NY"}, {"name": "North Carolina", "abbreviation": "NC"}, {"name": "North Dakota", "abbreviation": "ND"}, {"name": "Northern Mariana Islands", "abbreviation": "MP"}, {"name": "Ohio", "abbreviation": "OH"}, {"name": "Oklahoma", "abbreviation": "OK"}, {"name": "Oregon", "abbreviation": "OR"}, {"name": "Palau", "abbreviation": "PW"}, {"name": "Pennsylvania", "abbreviation": "PA"}, {"name": "Puerto Rico", "abbreviation": "PR"}, {"name": "Rhode Island", "abbreviation": "RI"}, {"name": "South Carolina", "abbreviation": "SC"}, {"name": "South Dakota", "abbreviation": "SD"}, {"name": "Tennessee", "abbreviation": "TN"}, {"name": "Texas", "abbreviation": "TX"}, {"name": "Utah", "abbreviation": "UT"}, {"name": "Vermont", "abbreviation": "VT"}, {"name": "Virgin Islands", "abbreviation": "VI"}, {"name": "Virginia", "abbreviation": "VA"}, {"name": "Washington", "abbreviation": "WA"}, {"name": "West Virginia", "abbreviation": "WV"}, {"name": "Wisconsin", "abbreviation": "WI"}, {"name": "Wyoming", "abbreviation": "WY"} ];

const getRegularizedParty = function(party) { 
  party = party || '';
  return (party.toLowerCase().includes('republican')) ? 'republican' : (party.toLowerCase().includes('democrat')) ? 'democrat' : 'third'; 
};

var parties = {};
raw_parties.forEach(p => parties[p.party_id] = p.party );

raw_elections.features.forEach(e => {
	const year = 1786 + parseInt(e.properties.CONGRESS) * 2,
		state = (namesAndAbbrs.find(s => s.name == e.properties.STATENAME)) ? namesAndAbbrs.find(s => s.name == e.properties.STATENAME).abbreviation : null,
		district = parseInt(e.properties.DISTRICT);
	elections[year] = elections[year] || {};
	elections[year][state] = elections[year][state] || {};
	elections[year][state][district] = {
		party_of_victory: parties[e.properties.PARTY_OF_1],
		regularized_party_of_victory: getRegularizedParty(parties[e.properties.PARTY_OF_1]),
		percent_vote: (e.properties.TOTAL_VOTE && e.properties.VICTOR_VOT) ?  Math.round(parseInt(e.properties.VICTOR_VOT) / parseInt(e.properties.TOTAL_VOTE) * 10000)/10000 : -1
	};

});

fs.writeFile('elections.json', JSON.stringify(elections, null, ' '), (err) => {
  if (err) throw err;
  console.log('wrote to file: elections.json');
});