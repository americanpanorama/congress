import * as d3 from "d3";

const repColor = '#eb3f3f';
const demColor = '#4a4ae4';
const thirdColor = 'orange';

export const getColorForParty = function(party) { return (party.toLowerCase().includes('republican')) ? repColor : (party.toLowerCase().includes('democrat')) ? demColor : thirdColor; };

export const getColorForMargin = function(party, percent) {
  party = party || '';
  if (percent == -1) {
    return "gold";
  }

  var repColor = d3.scaleLinear()
      .domain([-1, 0.5, 1])
      .range(['#FACFCF', '#FACFCF', '#eb3f3f']);

  var demColor = d3.scaleLinear()
      .domain([-1, 0.5, 1])
      .range(['#D2D2F8', '#D2D2F8', '#4a4ae4']);


  if (party.toLowerCase().includes('republican')) {
    return repColor(percent);
  }

  if (party.toLowerCase().includes('democrat')) {
    return demColor(percent);
  }

  return 'orange'
};

export const yearForCongress = function (congress) { return 1786 + congress * 2; };

export const congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

export const getStateAbbr = function(state) {
    const namesAndAbbrs = [{"name": "Alabama", "abbreviation": "AL"}, {"name": "Alaska", "abbreviation": "AK"}, {"name": "American Samoa", "abbreviation": "AS"}, {"name": "Arizona", "abbreviation": "AZ"}, {"name": "Arkansas", "abbreviation": "AR"}, {"name": "California", "abbreviation": "CA"}, {"name": "Colorado", "abbreviation": "CO"}, {"name": "Connecticut", "abbreviation": "CT"}, {"name": "Delaware", "abbreviation": "DE"}, {"name": "District Of Columbia", "abbreviation": "DC"}, {"name": "Federated States Of Micronesia", "abbreviation": "FM"}, {"name": "Florida", "abbreviation": "FL"}, {"name": "Georgia", "abbreviation": "GA"}, {"name": "Guam", "abbreviation": "GU"}, {"name": "Hawaii", "abbreviation": "HI"}, {"name": "Idaho", "abbreviation": "ID"}, {"name": "Illinois", "abbreviation": "IL"}, {"name": "Indiana", "abbreviation": "IN"}, {"name": "Iowa", "abbreviation": "IA"}, {"name": "Kansas", "abbreviation": "KS"}, {"name": "Kentucky", "abbreviation": "KY"}, {"name": "Louisiana", "abbreviation": "LA"}, {"name": "Maine", "abbreviation": "ME"}, {"name": "Marshall Islands", "abbreviation": "MH"}, {"name": "Maryland", "abbreviation": "MD"}, {"name": "Massachusetts", "abbreviation": "MA"}, {"name": "Michigan", "abbreviation": "MI"}, {"name": "Minnesota", "abbreviation": "MN"}, {"name": "Mississippi", "abbreviation": "MS"}, {"name": "Missouri", "abbreviation": "MO"}, {"name": "Montana", "abbreviation": "MT"}, {"name": "Nebraska", "abbreviation": "NE"}, {"name": "Nevada", "abbreviation": "NV"}, {"name": "New Hampshire", "abbreviation": "NH"}, {"name": "New Jersey", "abbreviation": "NJ"}, {"name": "New Mexico", "abbreviation": "NM"}, {"name": "New York", "abbreviation": "NY"}, {"name": "North Carolina", "abbreviation": "NC"}, {"name": "North Dakota", "abbreviation": "ND"}, {"name": "Northern Mariana Islands", "abbreviation": "MP"}, {"name": "Ohio", "abbreviation": "OH"}, {"name": "Oklahoma", "abbreviation": "OK"}, {"name": "Oregon", "abbreviation": "OR"}, {"name": "Palau", "abbreviation": "PW"}, {"name": "Pennsylvania", "abbreviation": "PA"}, {"name": "Puerto Rico", "abbreviation": "PR"}, {"name": "Rhode Island", "abbreviation": "RI"}, {"name": "South Carolina", "abbreviation": "SC"}, {"name": "South Dakota", "abbreviation": "SD"}, {"name": "Tennessee", "abbreviation": "TN"}, {"name": "Texas", "abbreviation": "TX"}, {"name": "Utah", "abbreviation": "UT"}, {"name": "Vermont", "abbreviation": "VT"}, {"name": "Virgin Islands", "abbreviation": "VI"}, {"name": "Virginia", "abbreviation": "VA"}, {"name": "Washington", "abbreviation": "WA"}, {"name": "West Virginia", "abbreviation": "WV"}, {"name": "Wisconsin", "abbreviation": "WI"}, {"name": "Wyoming", "abbreviation": "WY"} ];
    return namesAndAbbrs.find(s => s.name == state).abbreviation;
};