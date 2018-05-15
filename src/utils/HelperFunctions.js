import * as d3 from "d3";

const repColor = '#FB6765';
const repColorLight = '#FACFCF';
const demColor = '#717EFF';
const demColorLight = '#D2D2F8';
const whigColor = '#D4C685';
const thirdColor = '#98B9AB';
const equalColor = '#BEBEBE'

export const getColorForParty = function(party) { return (!party) ? 'yellow' : (party.toLowerCase().includes('republican')) ? repColor : (party.toLowerCase().includes('democrat')) ? demColor : (party.toLowerCase().includes('whig')) ? whigColor : thirdColor; };

export const getColorForMargin = function(party, percent) {
  party = party || '';
  if (percent < 0) {
    return "transparent";
  }

  var repColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, repColor]);

  var demColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, demColor]);

  var whigColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, whigColor]);

  var thirdColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, thirdColor]);

  var getRepColor = d3.scaleLinear()
      .domain([-1, 0.5, 0.55, 1])
      .range([equalColor, equalColor, repColorAdjustment(-0.2), repColor]);

  var getDemColor = d3.scaleLinear()
      .domain([-1, 0.5, 0.55, 1])
      .range([equalColor, equalColor, demColorAdjustment(-0.2), demColor]);

  var getWhigColor = d3.scaleLinear()
      .domain([-1, 0.5, 0.55, 1])
      .range([equalColor, equalColor, whigColorAdjustment(-0.2), whigColor]);

  var getThirdColor = d3.scaleLinear()
      .domain([-1, 0.5, 0.55, 1])
      .range([equalColor, equalColor, thirdColorAdjustment(-0.2), thirdColor]);


  if (party.toLowerCase().includes('republican')) {
    return getRepColor(percent);
  }

  if (party.toLowerCase().includes('democrat')) {
    return getDemColor(percent);
  }

  if (party.toLowerCase().includes('whig')) {
    return getWhigColor(percent);
  }

  if (party.toLowerCase().includes('third')) {
    return getThirdColor(percent);
  }

  return 'orange'
};

export const yearForCongress = function (congress) { return 1786 + congress * 2; };

export const congressForYear = function (year) { return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); };

export const ordinalSuffixOf = function(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
};

export const getStateAbbr = function(state) {
    const namesAndAbbrs = [{"name": "Alabama", "abbreviation": "AL"}, {"name": "Alaska", "abbreviation": "AK"}, {"name": "American Samoa", "abbreviation": "AS"}, {"name": "Arizona", "abbreviation": "AZ"}, {"name": "Arkansas", "abbreviation": "AR"}, {"name": "California", "abbreviation": "CA"}, {"name": "Colorado", "abbreviation": "CO"}, {"name": "Connecticut", "abbreviation": "CT"}, {"name": "Delaware", "abbreviation": "DE"}, {"name": "District Of Columbia", "abbreviation": "DC"}, {"name": "Federated States Of Micronesia", "abbreviation": "FM"}, {"name": "Florida", "abbreviation": "FL"}, {"name": "Georgia", "abbreviation": "GA"}, {"name": "Guam", "abbreviation": "GU"}, {"name": "Hawaii", "abbreviation": "HI"}, {"name": "Idaho", "abbreviation": "ID"}, {"name": "Illinois", "abbreviation": "IL"}, {"name": "Indiana", "abbreviation": "IN"}, {"name": "Iowa", "abbreviation": "IA"}, {"name": "Kansas", "abbreviation": "KS"}, {"name": "Kentucky", "abbreviation": "KY"}, {"name": "Louisiana", "abbreviation": "LA"}, {"name": "Maine", "abbreviation": "ME"}, {"name": "Marshall Islands", "abbreviation": "MH"}, {"name": "Maryland", "abbreviation": "MD"}, {"name": "Massachusetts", "abbreviation": "MA"}, {"name": "Michigan", "abbreviation": "MI"}, {"name": "Minnesota", "abbreviation": "MN"}, {"name": "Mississippi", "abbreviation": "MS"}, {"name": "Missouri", "abbreviation": "MO"}, {"name": "Montana", "abbreviation": "MT"}, {"name": "Nebraska", "abbreviation": "NE"}, {"name": "Nevada", "abbreviation": "NV"}, {"name": "New Hampshire", "abbreviation": "NH"}, {"name": "New Jersey", "abbreviation": "NJ"}, {"name": "New Mexico", "abbreviation": "NM"}, {"name": "New York", "abbreviation": "NY"}, {"name": "North Carolina", "abbreviation": "NC"}, {"name": "North Dakota", "abbreviation": "ND"}, {"name": "Northern Mariana Islands", "abbreviation": "MP"}, {"name": "Ohio", "abbreviation": "OH"}, {"name": "Oklahoma", "abbreviation": "OK"}, {"name": "Oregon", "abbreviation": "OR"}, {"name": "Palau", "abbreviation": "PW"}, {"name": "Pennsylvania", "abbreviation": "PA"}, {"name": "Puerto Rico", "abbreviation": "PR"}, {"name": "Rhode Island", "abbreviation": "RI"}, {"name": "South Carolina", "abbreviation": "SC"}, {"name": "South Dakota", "abbreviation": "SD"}, {"name": "Tennessee", "abbreviation": "TN"}, {"name": "Texas", "abbreviation": "TX"}, {"name": "Utah", "abbreviation": "UT"}, {"name": "Vermont", "abbreviation": "VT"}, {"name": "Virgin Islands", "abbreviation": "VI"}, {"name": "Virginia", "abbreviation": "VA"}, {"name": "Washington", "abbreviation": "WA"}, {"name": "West Virginia", "abbreviation": "WV"}, {"name": "Wisconsin", "abbreviation": "WI"}, {"name": "Wyoming", "abbreviation": "WY"} ];
    return namesAndAbbrs.find(s => s.name == state).abbreviation;
};

export const getStateName = function(abbr) {
    const namesAndAbbrs = [{"name": "Alabama", "abbreviation": "AL"}, {"name": "Alaska", "abbreviation": "AK"}, {"name": "American Samoa", "abbreviation": "AS"}, {"name": "Arizona", "abbreviation": "AZ"}, {"name": "Arkansas", "abbreviation": "AR"}, {"name": "California", "abbreviation": "CA"}, {"name": "Colorado", "abbreviation": "CO"}, {"name": "Connecticut", "abbreviation": "CT"}, {"name": "Delaware", "abbreviation": "DE"}, {"name": "District Of Columbia", "abbreviation": "DC"}, {"name": "Federated States Of Micronesia", "abbreviation": "FM"}, {"name": "Florida", "abbreviation": "FL"}, {"name": "Georgia", "abbreviation": "GA"}, {"name": "Guam", "abbreviation": "GU"}, {"name": "Hawaii", "abbreviation": "HI"}, {"name": "Idaho", "abbreviation": "ID"}, {"name": "Illinois", "abbreviation": "IL"}, {"name": "Indiana", "abbreviation": "IN"}, {"name": "Iowa", "abbreviation": "IA"}, {"name": "Kansas", "abbreviation": "KS"}, {"name": "Kentucky", "abbreviation": "KY"}, {"name": "Louisiana", "abbreviation": "LA"}, {"name": "Maine", "abbreviation": "ME"}, {"name": "Marshall Islands", "abbreviation": "MH"}, {"name": "Maryland", "abbreviation": "MD"}, {"name": "Massachusetts", "abbreviation": "MA"}, {"name": "Michigan", "abbreviation": "MI"}, {"name": "Minnesota", "abbreviation": "MN"}, {"name": "Mississippi", "abbreviation": "MS"}, {"name": "Missouri", "abbreviation": "MO"}, {"name": "Montana", "abbreviation": "MT"}, {"name": "Nebraska", "abbreviation": "NE"}, {"name": "Nevada", "abbreviation": "NV"}, {"name": "New Hampshire", "abbreviation": "NH"}, {"name": "New Jersey", "abbreviation": "NJ"}, {"name": "New Mexico", "abbreviation": "NM"}, {"name": "New York", "abbreviation": "NY"}, {"name": "North Carolina", "abbreviation": "NC"}, {"name": "North Dakota", "abbreviation": "ND"}, {"name": "Northern Mariana Islands", "abbreviation": "MP"}, {"name": "Ohio", "abbreviation": "OH"}, {"name": "Oklahoma", "abbreviation": "OK"}, {"name": "Oregon", "abbreviation": "OR"}, {"name": "Palau", "abbreviation": "PW"}, {"name": "Pennsylvania", "abbreviation": "PA"}, {"name": "Puerto Rico", "abbreviation": "PR"}, {"name": "Rhode Island", "abbreviation": "RI"}, {"name": "South Carolina", "abbreviation": "SC"}, {"name": "South Dakota", "abbreviation": "SD"}, {"name": "Tennessee", "abbreviation": "TN"}, {"name": "Texas", "abbreviation": "TX"}, {"name": "Utah", "abbreviation": "UT"}, {"name": "Vermont", "abbreviation": "VT"}, {"name": "Virgin Islands", "abbreviation": "VI"}, {"name": "Virginia", "abbreviation": "VA"}, {"name": "Washington", "abbreviation": "WA"}, {"name": "West Virginia", "abbreviation": "WV"}, {"name": "Wisconsin", "abbreviation": "WI"}, {"name": "Wyoming", "abbreviation": "WY"} ];
    return namesAndAbbrs.find(s => s.abbreviation == abbr).name;
};