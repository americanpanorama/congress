const fs = require('fs');
const d3 = require('d3');

// load raw data files
const elections = require('./data/elections.json');
const rawCentroids = require('./data/centroids.json');
const rawPolylabels = require('./data/polylabelCoords.json');
const rawMetros = require('./data/metro_areas.json');
const rawParties = require('./data/party_codebook.json');

// initialize variablesc
const projection = d3.geoAlbersUsa();
const path = d3.geoPath().projection(projection);

const congressesData = {};
const namesAndAbbrs = [{"name": "Alabama", "abbreviation": "AL"}, {"name": "Alaska", "abbreviation": "AK"}, {"name": "American Samoa", "abbreviation": "AS"}, {"name": "Arizona", "abbreviation": "AZ"}, {"name": "Arkansas", "abbreviation": "AR"}, {"name": "California", "abbreviation": "CA"}, {"name": "Colorado", "abbreviation": "CO"}, {"name": "Connecticut", "abbreviation": "CT"}, {"name": "Delaware", "abbreviation": "DE"}, {"name": "District Of Columbia", "abbreviation": "DC"}, {"name": "Federated States Of Micronesia", "abbreviation": "FM"}, {"name": "Florida", "abbreviation": "FL"}, {"name": "Georgia", "abbreviation": "GA"}, {"name": "Guam", "abbreviation": "GU"}, {"name": "Hawaii", "abbreviation": "HI"}, {"name": "Idaho", "abbreviation": "ID"}, {"name": "Illinois", "abbreviation": "IL"}, {"name": "Indiana", "abbreviation": "IN"}, {"name": "Iowa", "abbreviation": "IA"}, {"name": "Kansas", "abbreviation": "KS"}, {"name": "Kentucky", "abbreviation": "KY"}, {"name": "Louisiana", "abbreviation": "LA"}, {"name": "Maine", "abbreviation": "ME"}, {"name": "Marshall Islands", "abbreviation": "MH"}, {"name": "Maryland", "abbreviation": "MD"}, {"name": "Massachusetts", "abbreviation": "MA"}, {"name": "Michigan", "abbreviation": "MI"}, {"name": "Minnesota", "abbreviation": "MN"}, {"name": "Mississippi", "abbreviation": "MS"}, {"name": "Missouri", "abbreviation": "MO"}, {"name": "Montana", "abbreviation": "MT"}, {"name": "Nebraska", "abbreviation": "NE"}, {"name": "Nevada", "abbreviation": "NV"}, {"name": "New Hampshire", "abbreviation": "NH"}, {"name": "New Jersey", "abbreviation": "NJ"}, {"name": "New Mexico", "abbreviation": "NM"}, {"name": "New York", "abbreviation": "NY"}, {"name": "North Carolina", "abbreviation": "NC"}, {"name": "North Dakota", "abbreviation": "ND"}, {"name": "Northern Mariana Islands", "abbreviation": "MP"}, {"name": "Ohio", "abbreviation": "OH"}, {"name": "Oklahoma", "abbreviation": "OK"}, {"name": "Oregon", "abbreviation": "OR"}, {"name": "Palau", "abbreviation": "PW"}, {"name": "Pennsylvania", "abbreviation": "PA"}, {"name": "Puerto Rico", "abbreviation": "PR"}, {"name": "Rhode Island", "abbreviation": "RI"}, {"name": "South Carolina", "abbreviation": "SC"}, {"name": "South Dakota", "abbreviation": "SD"}, {"name": "Tennessee", "abbreviation": "TN"}, {"name": "Texas", "abbreviation": "TX"}, {"name": "Utah", "abbreviation": "UT"}, {"name": "Vermont", "abbreviation": "VT"}, {"name": "Virgin Islands", "abbreviation": "VI"}, {"name": "Virginia", "abbreviation": "VA"}, {"name": "Washington", "abbreviation": "WA"}, {"name": "West Virginia", "abbreviation": "WV"}, {"name": "Wisconsin", "abbreviation": "WI"}, {"name": "Wyoming", "abbreviation": "WY"} ];
const stateAltNames = {"TEX": "TX", "MASS": "MA", "TENN": "TN", "ILL": "IL", "ARK": "AR", "MISS": "MS", "CALIF": "CA", "ALA": "AL", "HAWAII": "HA", "IND": "IN", "FLA": "FL", "UTAH": "UT", "MONT": "MT", "OREG": "OR", "MICH": "MI", "KANS": "KA", "CONN": "CO", "OKLA": "OK", "IOWA": "IO", "NEBR": "NE", "Texarkana, AR": "null", "ARIZ": "AZ", "ORTHEAST PENNSYLVANIA": "null", "NEV": "NV", "WIS": "WI", "N DAK": "ND", "MINN": "MN", "OHIO": "OH", "W VA": "WV", "COLO": "CO", "WASH": "WA", "TEXARKANA, ARK": "null", "S DAK": "SD", "MAINE": "ME", "N MEX": "NM", "ALASKA": "AK", "DEL": "DE", "WYO": "WY", "IDAHO": "ID"};
const enclosingCircleRadii = { "3": 2.154, "4": 2.4, "5": 2.7, "6": 3, "7": 3, "8": 3.304, "9": 3.613, "10": 3.813, "11": 3.923, "12": 4.029, "13": 4.236, "14": 4.328, "15": 4.521, "16": 4.615, "17": 4.8, "18": 4.9, "19": 4.9, "20": 5.2, "21": 5.3, "22": 5.5, "23": 5.6, "24": 5.7, "25": 5.8, "26": 5.9, "27": 6, "28": 6.1, "29": 6.2, "30": 6.2, "31": 6.3, "32": 6.5, "33": 6.5, "34": 6.7, "35": 6.7, "36": 6.8, "37": 6.8, "38": 7, "39": 7.1, "40": 7.2, "41": 7.3, "42": 7.4, "43": 7.5, "44": 7.55, "45": 7.6 };
const metrosCountsByYear = {};
const metros3orMore = {};

// helper functions
const getStateAbbr = (state) => (namesAndAbbrs.find(s => s.name == state)) ? namesAndAbbrs.find(s => s.name == state).abbreviation : null;

const getDecade = year => [Math.floor(year / 10) * 10];

const getMetro = function (year, centroid, id, metros) {
  let city = false;
  // check to see if you've already found it
  metros.forEach((m) => {
    if (d3.geoContains(m.geometry, centroid)) {
      city = m.name;
    }
  });
  return city;
};

const getColor = function (party, percent) {
  party = party || '';
  if (percent === -1) { return 'gold'; }
  const repColor = d3.scaleLinear().domain([-1, 0.5, 1]).range(['#FACFCF', '#FACFCF', '#eb3f3f']);
  const demColor = d3.scaleLinear().domain([-1, 0.5, 1]).range(['#D2D2F8', '#D2D2F8', '#4a4ae4']);
  return (party.toLowerCase().includes('republican')) ? repColor(percent) : (party.toLowerCase().includes('democrat')) ? demColor(percent) : 'green';
};

// initial processing of data
console.log('initializing parties ...');
const parties = {};
rawParties.forEach((p) => {
  parties[p.party_id] = p.party;
});

console.log('initializing centroids ...');
const polylabels = {};
rawPolylabels.features.forEach((c) => {
  if (c.geometry) {
    polylabels[c.properties.id] = c.geometry.coordinates;
  }
});

console.log('initializing centroids ...');
const centroids = {};
rawCentroids.features.forEach((c) => {
  if (c.geometry) {
    centroids[c.properties.id] = c.geometry.coordinates;
  }
});

console.log('initializing metros ...');
const metros = {};
rawMetros.features.forEach((m) => {
  metros[m.properties.year] = metros[m.properties.year] || {};
  const states = m.properties.name.substring(m.properties.name.indexOf(',') + 2).split('-');
  states.forEach((s) => {
    let state = s.replace(/\./g, '');
    state = (state.length === 2) ? state : stateAltNames[state];
    metros[m.properties.year][state] = metros[m.properties.year][state] || [];
    metros[m.properties.year][state].push({
      name: m.properties.name,
      centroid: [m.properties.lng, m.properties.lat],
      geometry: m.geometry
    });
  });
});

// use 1940 for each previous decade
for (let d = 1790; d <= 1940; d += 10) {
  metros[d] = metros['1950'];
}
metros['1990'] = metros['1980'];
metros['2000'] = metros['1980'];
metros['2010'] = metros['1980'];

console.log('initializing elections ...');

const electionData = [];
Object.keys(elections).forEach((year) => {
  Object.keys(elections[year]).forEach((state) => {
    Object.keys(elections[year][state]).forEach((district) => {
      year = parseInt(year);
      const decade = getDecade(year);

      if (district !== 'GT' && district !== 'AL') {
        const centroid = polylabels[elections[year][state][district].id] ||
         centroids[elections[year][state][district].id];

        if (centroid) {
          const metro = (metros[decade] && metros[decade][state]) ?
            getMetro(metros[decade][state], centroid, elections[year][state][district].id, metros[decade][state]) :
            false;

          if (metro) {
            metrosCountsByYear[year] = metrosCountsByYear[year] || {};
            metrosCountsByYear[year][metro] = metrosCountsByYear[year][metro] || 0;
            metrosCountsByYear[year][metro] += 1;
          }

          elections[year][state][district].year = year;
          elections[year][state][district].districtNum = parseInt(district, 10);
          elections[year][state][district].district = state + district;
          elections[year][state][district].centroid = centroid;
          elections[year][state][district].party = elections[year][state][district].party_of_victory;
          elections[year][state][district].metro = metro;

          electionData.push(elections[year][state][district]);
        }
      } else {
        elections[year][state][district].forEach((alDistrict, i) => {
          const centroid = polylabels[alDistrict.id] || centroids[alDistrict.id];
          const alElection = alDistrict;

          if (centroid) {
            alElection.id = `${alDistrict.id}-${i}`;
            alElection.year = year;
            alElection.districtNum = district;
            alElection.district = state + district;
            alElection.centroid = centroid;
            alElection.party = alDistrict.party_of_victory;
            alElection.metro = false;

            electionData.push(alElection);
          }
        });
      }
    });
  });
});

// calculate which cities have three or more congresspeople in a given year
console.log('calculating metro areas with 3 congresspeople ...');
Object.keys(metrosCountsByYear).forEach((year) => {
  metros3orMore[year] = [];
  Object.keys(metrosCountsByYear[year]).forEach((city) => {
    if (metrosCountsByYear[year][city] >= 3 && !Object.keys(metros3orMore[year]).includes(city)) {
      let centroid = null;
      Object.keys(metros[Math.floor(year / 10) * 10]).forEach((state) => {
        metros[Math.floor(year / 10) * 10][state].forEach((m) => {
          if (m.name === city) {
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
electionData.forEach((election) => {
  // calculate node attributes
  const year = election.year;
  const pathD = path({ type: 'Point', coordinates: election.centroid });
  const point = [parseFloat(pathD.substr(1, 7)), parseFloat(pathD.substr(pathD.indexOf(',') + 1, 7))];
  const node = {
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
  congressesData[year] = congressesData[year] || {
    // add the city bubbles used to reserve space for them in the dorling diagram
    notCity: (metros3orMore[year]) ? metros3orMore[year].map((cityData) => {
      const pathD = path({ type: 'Point', coordinates: cityData.centroid });
      const point = [parseFloat(pathD.substr(1, 7)), parseFloat(pathD.substr(pathD.indexOf(',') + 1, 7))];
      return {
        x: point[0],
        y: point[1],
        r: enclosingCircleRadii[cityData.count] * 8 + 5,
        id: cityData.city,
        class: 'city',
        color: 'transparent',
        xOrigin: point[0],
        yOrigin: point[1]
      };
    }) : [],
    // initialize object that will contain city bubbles to be located within the bubbles
    cities: {}
  };

  // put the node in the city or notCity
  if (metros3orMore[year] && metros3orMore[year].map(m => m.city).includes(election.metro)) {
    congressesData[year].cities[election.metro] = congressesData[year].cities[election.metro] || [];
    congressesData[year].cities[election.metro].push(node);
  } else {
    congressesData[year].notCity.push(node);
  }
});

console.log('writing file ...');
fs.writeFile('./data/dorlingNodes.json', JSON.stringify(congressesData, null, ' '), (err) => {
  if (err) throw err;
  console.log('COMPLETE');
});
