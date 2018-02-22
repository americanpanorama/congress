var fs = require('fs'),
  d3 = require("d3");

// load raw data files
const raw_elections = require('./raw-data/elections.json'),
  raw_centroids = require('./raw-data/centroids.json'),
  raw_metros = require('./raw-data/metro_areas.json'),
  raw_parties = require('./raw-data/party_codebook.json');

// initialize variables
var projection = d3.geoAlbersUsa(),
  path = d3.geoPath().projection(projection);

var year, 
  congress = 83,
  congresses_data = {},
  metroDistricts = {},
  metro_data,
  congresses,
  radius = 5, 
  namesAndAbbrs = [{"name": "Alabama", "abbreviation": "AL"}, {"name": "Alaska", "abbreviation": "AK"}, {"name": "American Samoa", "abbreviation": "AS"}, {"name": "Arizona", "abbreviation": "AZ"}, {"name": "Arkansas", "abbreviation": "AR"}, {"name": "California", "abbreviation": "CA"}, {"name": "Colorado", "abbreviation": "CO"}, {"name": "Connecticut", "abbreviation": "CT"}, {"name": "Delaware", "abbreviation": "DE"}, {"name": "District Of Columbia", "abbreviation": "DC"}, {"name": "Federated States Of Micronesia", "abbreviation": "FM"}, {"name": "Florida", "abbreviation": "FL"}, {"name": "Georgia", "abbreviation": "GA"}, {"name": "Guam", "abbreviation": "GU"}, {"name": "Hawaii", "abbreviation": "HI"}, {"name": "Idaho", "abbreviation": "ID"}, {"name": "Illinois", "abbreviation": "IL"}, {"name": "Indiana", "abbreviation": "IN"}, {"name": "Iowa", "abbreviation": "IA"}, {"name": "Kansas", "abbreviation": "KS"}, {"name": "Kentucky", "abbreviation": "KY"}, {"name": "Louisiana", "abbreviation": "LA"}, {"name": "Maine", "abbreviation": "ME"}, {"name": "Marshall Islands", "abbreviation": "MH"}, {"name": "Maryland", "abbreviation": "MD"}, {"name": "Massachusetts", "abbreviation": "MA"}, {"name": "Michigan", "abbreviation": "MI"}, {"name": "Minnesota", "abbreviation": "MN"}, {"name": "Mississippi", "abbreviation": "MS"}, {"name": "Missouri", "abbreviation": "MO"}, {"name": "Montana", "abbreviation": "MT"}, {"name": "Nebraska", "abbreviation": "NE"}, {"name": "Nevada", "abbreviation": "NV"}, {"name": "New Hampshire", "abbreviation": "NH"}, {"name": "New Jersey", "abbreviation": "NJ"}, {"name": "New Mexico", "abbreviation": "NM"}, {"name": "New York", "abbreviation": "NY"}, {"name": "North Carolina", "abbreviation": "NC"}, {"name": "North Dakota", "abbreviation": "ND"}, {"name": "Northern Mariana Islands", "abbreviation": "MP"}, {"name": "Ohio", "abbreviation": "OH"}, {"name": "Oklahoma", "abbreviation": "OK"}, {"name": "Oregon", "abbreviation": "OR"}, {"name": "Palau", "abbreviation": "PW"}, {"name": "Pennsylvania", "abbreviation": "PA"}, {"name": "Puerto Rico", "abbreviation": "PR"}, {"name": "Rhode Island", "abbreviation": "RI"}, {"name": "South Carolina", "abbreviation": "SC"}, {"name": "South Dakota", "abbreviation": "SD"}, {"name": "Tennessee", "abbreviation": "TN"}, {"name": "Texas", "abbreviation": "TX"}, {"name": "Utah", "abbreviation": "UT"}, {"name": "Vermont", "abbreviation": "VT"}, {"name": "Virgin Islands", "abbreviation": "VI"}, {"name": "Virginia", "abbreviation": "VA"}, {"name": "Washington", "abbreviation": "WA"}, {"name": "West Virginia", "abbreviation": "WV"}, {"name": "Wisconsin", "abbreviation": "WI"}, {"name": "Wyoming", "abbreviation": "WY"} ],
  stateAltNames = {"TEX": "TX", "MASS": "MA", "TENN": "TN", "ILL": "IL", "ARK": "AR", "MISS": "MS", "CALIF": "CA", "ALA": "AL", "HAWAII": "HA", "IND": "IN", "FLA": "FL", "UTAH": "UT", "MONT": "MT", "OREG": "OR", "MICH": "MI", "KANS": "KA", "CONN": "CO", "OKLA": "OK", "IOWA": "IO", "NEBR": "NE", "Texarkana, AR": "null", "ARIZ": "AZ", "ORTHEAST PENNSYLVANIA": "null", "NEV": "NV", "WIS": "WI", "N DAK": "ND", "MINN": "MN", "OHIO": "OH", "W VA": "WV", "COLO": "CO", "WASH": "WA", "TEXARKANA, ARK": "null", "S DAK": "SD", "MAINE": "ME", "N MEX": "NM", "ALASKA": "AK", "DEL": "DE", "WYO": "WY", "IDAHO": "ID"},
  enclosing_circle_radii ={"3": 2.154, "4": 2.4, "5": 2.7, "6": 3, "7": 3, "8": 3.304, "9": 3.613, "10": 3.813, "11": 3.923, "12": 4.029, "13": 4.236, "14": 4.328, "15": 4.521, "16": 4.615, "17": 4.8, "18": 4.9, "19": 4.9, "20": 5.2, "21": 5.3, "22": 5.5, "23": 5.6, "24": 5.7, "25": 5.8, "26": 5.9, "27": 6, "28": 6.1, "29": 6.2, "30": 6.2, "31": 6.3, "32": 6.5, "33": 6.5, "34": 6.7, "35": 6.7, "36": 6.8, "37": 6.8, "38": 7, "39": 7.1, "40": 7.2, "41": 7.3, "42": 7.4, "43": 7.5, "44": 7.55, "45": 7.6},
  metrosFound = { 1950: {}, 1960: {}, 1970: {}, 1980: {}, 1990: {}, 2000: {}, 2010: {} },
  metrosCountsByYear = {},
  metros3orMore = {};

// helper functions
const getStateAbbr = (state) => (namesAndAbbrs.find(s => s.name == state)) ? namesAndAbbrs.find(s => s.name == state).abbreviation : null,
  getDecade = (year) => [Math.floor(year/10) * 10];

const getMetro = function(year, centroid, id, metros) {
  let city = false;
  // check to see if you've already found it
  metros.forEach(m => {
    if (d3.geoContains(m.geometry, centroid)) {
      city = m.name;
    }
  });
  return city;
};

const getRegularizedParty = function(party) { 
  party = party || '';
  return (party.toLowerCase().includes('republican')) ? 'republican' : (party.toLowerCase().includes('democrat')) ? 'democrat' : 'third'; 
};

const getColor = function(party, percent) {
  party = party || '';
  if (percent == -1) { return "gold"; }
  var repColor = d3.scaleLinear().domain([-1, 0.5, 1]).range(['#FACFCF', '#FACFCF', '#eb3f3f']),
    demColor = d3.scaleLinear().domain([-1, 0.5, 1]).range(['#D2D2F8', '#D2D2F8', '#4a4ae4']);
  return (party.toLowerCase().includes('republican')) ? repColor(percent) : (party.toLowerCase().includes('democrat')) ? demColor(percent) : 'green';
};


// initial processing of data
console.log('initializing parties ...');
let parties = {};
raw_parties.forEach(p => parties[p.party_id] = p.party );

console.log('initializing centroids ...');
let centroids = {};
raw_centroids.features.forEach(c => (c.geometry) ? centroids[c.properties.id] = c.geometry.coordinates : false);

console.log('initializing metros ...');
let metros = {};
raw_metros.features.forEach(m => {
  metros[m.properties.year] = metros[m.properties.year] || {};
  const states = m.properties.name.substring(m.properties.name.indexOf(',') + 2).split('-');
  states.forEach(state => {
    state = state.replace(/\./g,'');
    state = (state.length == 2) ? state : stateAltNames[state];
    metros[m.properties.year][state] = metros[m.properties.year][state] || [];
    metros[m.properties.year][state].push({
    name: m.properties.name,
      centroid: [m.properties.lng, m.properties.lat],
      geometry: m.geometry
    });
  });

  // use 1940 for each previous decade
  for (let d = 1790; d <= 1940; d += 10) {
    metros[d] = metros['1950'];
  }
});

console.log('initializing elections ...');
const election_data = raw_elections.features
  // filter out elections without a centroid or id
  .filter(e => centroids[e.properties.ID] && e.properties.ID)
  .map(e => {
    const year = 1786 + parseInt(e.properties.CONGRESS) * 2;
      stateAbbr = getStateAbbr(e.properties.STATENAME),
      metro = (metros[[Math.floor(year/10) * 10]] && metros[[Math.floor(year/10) * 10]][stateAbbr]) ? getMetro(year, centroids[e.properties.ID], e.properties.ID, metros[getDecade(year)][stateAbbr]) : false;

    if (metro) {
      metrosCountsByYear[year] = metrosCountsByYear[year] || {};
      metrosCountsByYear[year][metro] = metrosCountsByYear[year][metro] || 0;
      metrosCountsByYear[year][metro] += 1;
    }

    return {
      congress: parseInt(e.properties.CONGRESS),
      year: year,
      districtNum: parseInt(e.properties.DISTRICT),
      centroid: centroids[e.properties.ID],
      state: stateAbbr,
      district: stateAbbr + parseInt(e.properties.DISTRICT),
      id: e.properties.ID,
      party: parties[e.properties.PARTY_OF_1],
      regularized_party_of_victory: getRegularizedParty(parties[e.properties.PARTY_OF_1]),
      percent_vote: (e.properties.TOTAL_VOTE && e.properties.VICTOR_VOT) ?  parseInt(e.properties.VICTOR_VOT) / parseInt(e.properties.TOTAL_VOTE) : -1,
      metro: metro
    };  
  });

// calculate which cities have three or more congresspeople in a given year
console.log('calculating metro areas with 3 congresspeople ...');
Object.keys(metrosCountsByYear).forEach(year => {
  metros3orMore[year] = [];
  Object.keys(metrosCountsByYear[year]).forEach(city => {
    if (metrosCountsByYear[year][city] >= 3 && !Object.keys(metros3orMore[year]).includes(city)) {
      let centroid = null;
      Object.keys(metros[Math.floor(year/10)*10]).forEach(state => {
        metros[Math.floor(year/10)*10][state].forEach(m => {
          if (m.name == city) {
            centroid = m.centroid;
          }
        });
      });
      if (centroid) {
        metros3orMore[year].push({
          city: city,
          centroid: centroid,
          count: metrosCountsByYear[year][city]
        });
      }
    }
  });
});

console.log('creating and organizing nodes ...');
election_data.forEach(election => {
  // calculate node attributes
  const year = election.year,
    pathD = path({type:"Point", coordinates: election.centroid}),
    point = [parseFloat(pathD.substr(1,7)), parseFloat(pathD.substr(pathD.indexOf(',') + 1,7))],
    node = {
      x: point[0],
      y: point[1],
      r: 5,
      color: getColor(election.party, election.percent_vote),
      id: election.id,
      district: election.district,
      xOrigin: point[0],
      yOrigin: point[1]
    };

  // initialize object for year if necessary
  congresses_data[year] = congresses_data[year] || { 
    // add the city bubbles used to reserve space for them in the dorling diagram
    notCity: (metros3orMore[year]) ? metros3orMore[year].map(cityData => {
      const pathD = path({type:"Point", coordinates: cityData.centroid}),
        point = [parseFloat(pathD.substr(1,7)), parseFloat(pathD.substr(pathD.indexOf(',') + 1,7))];
      return {
        x: point[0],
        y: point[1],
        r: enclosing_circle_radii[cityData.count] * 8 + 5,
        id: cityData.city,
        class: 'city',
        color: 'transparent',
        xOrigin: point[0],
        yOrigin: point[1]
      };
    }) : [],
    // initialize object that will contain city bubbles to be located within the bubbles
    cities: {},
  };

  // put the node in the city or notCity
  if (metros3orMore[year] && metros3orMore[year].map(m => m.city).includes(election.metro)) {
    congresses_data[year].cities[election.metro] = congresses_data[year].cities[election.metro] || [];
    congresses_data[year].cities[election.metro].push(node);
  } else {
    congresses_data[year].notCity.push(node);
  }
  
});

console.log('writing file ...');
fs.writeFile('dorlingNodes.json', JSON.stringify(congresses_data, null, ' '), (err) => {
  if (err) throw err;
  console.log('COMPLETE');
});