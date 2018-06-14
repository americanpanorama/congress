import * as d3 from "d3";
import { parseFullName } from 'parse-full-name';

const repColor = '#FB6765';
const repColorLight = '#FACFCF';
const demColor = '#717EFF';
const demColorLight = '#D2D2F8';
const whigColor = '#FF7F50'; //'#D4C685';
const thirdColor = '#D4C685'; // '#98B9AB';
const equalColor = '#BEBEBE';
const stateAbbrs = [
  { state: 'Alabama', abbreviation: 'Ala.', postalCode: 'AL' },
  { state: 'Alaska', abbreviation: 'Alaska', postalCode: 'AK' },
  { state: 'Arizona', abbreviation: 'Ariz.', postalCode: 'AZ' },
  { state: 'Arkansas', abbreviation: 'Ark.', postalCode: 'AR' },
  { state: 'California', abbreviation: 'Calif.', postalCode: 'CA' },
  { state: 'Colorado', abbreviation: 'Colo.', postalCode: 'CO' },
  { state: 'Connecticut', abbreviation: 'Conn.', postalCode: 'CT' },
  { state: 'Delaware', abbreviation: 'Del.', postalCode: 'DE' },
  { state: 'District of Columbia', abbreviation: 'D.C.', postalCode: 'DC' },
  { state: 'Florida', abbreviation: 'Fla.', postalCode: 'FL' },
  { state: 'Georgia', abbreviation: 'Ga.', postalCode: 'GA' },
  { state: 'Guam', abbreviation: 'Guam', postalCode: 'GU' },
  { state: 'Hawaii', abbreviation: 'Hawaii', postalCode: 'HI' },
  { state: 'Idaho', abbreviation: 'Idaho', postalCode: 'ID' },
  { state: 'Illinois', abbreviation: 'Ill.', postalCode: 'IL' },
  { state: 'Indiana', abbreviation: 'Ind.', postalCode: 'IN' },
  { state: 'Iowa', abbreviation: 'Iowa', postalCode: 'IA' },
  { state: 'Kansas', abbreviation: 'Kans.', postalCode: 'KS' },
  { state: 'Kentucky', abbreviation: 'Ky.', postalCode: 'KY' },
  { state: 'Louisiana', abbreviation: 'La.', postalCode: 'LA' },
  { state: 'Maine', abbreviation: 'Maine', postalCode: 'ME' },
  { state: 'Maryland', abbreviation: 'Md.', postalCode: 'MD' },
  { state: 'Massachusetts', abbreviation: 'Mass.', postalCode: 'MA' },
  { state: 'Michigan', abbreviation: 'Mich.', postalCode: 'MI' },
  { state: 'Minnesota', abbreviation: 'Minn.', postalCode: 'MN' },
  { state: 'Mississippi', abbreviation: 'Miss.', postalCode: 'MS' },
  { state: 'Missouri', abbreviation: 'Mo.', postalCode: 'MO' },
  { state: 'Montana', abbreviation: 'Mont.', postalCode: 'MT' },
  { state: 'Nebraska', abbreviation: 'Nebr.', postalCode: 'NE' },
  { state: 'Nevada', abbreviation: 'Nev.', postalCode: 'NV' },
  { state: 'New Hampshire', abbreviation: 'N.H.', postalCode: 'NH' },
  { state: 'New Jersey', abbreviation: 'N.J.', postalCode: 'NJ' },
  { state: 'New Mexico', abbreviation: 'N.M.', postalCode: 'NM' },
  { state: 'New York', abbreviation: 'N.Y.', postalCode: 'NY' },
  { state: 'North Carolina', abbreviation: 'N.C.', postalCode: 'NC' },
  { state: 'North Dakota', abbreviation: 'N.D.', postalCode: 'ND' },
  { state: 'Ohio', abbreviation: 'Ohio', postalCode: 'OH' },
  { state: 'Oklahoma', abbreviation: 'Okla.', postalCode: 'OK' },
  { state: 'Oregon', abbreviation: 'Ore.', postalCode: 'OR' },
  { state: 'Pennsylvania', abbreviation: 'Pa.', postalCode: 'PA' },
  { state: 'Puerto Rico', abbreviation: 'P.R.', postalCode: 'PR' },
  { state: 'Rhode Island', abbreviation: 'R.I.', postalCode: 'RI' },
  { state: 'South Carolina', abbreviation: 'S.C.', postalCode: 'SC' },
  { state: 'South Dakota', abbreviation: 'S.D.', postalCode: 'SD' },
  { state: 'Tennessee', abbreviation: 'Tenn.', postalCode: 'TN' },
  { state: 'Texas', abbreviation: 'Tex.', postalCode: 'TX' },
  { state: 'Utah', abbreviation: 'Utah', postalCode: 'UT' },
  { state: 'Vermont', abbreviation: 'Vt.', postalCode: 'VT' },
  { state: 'Virginia', abbreviation: 'Va.', postalCode: 'VA' },
  { state: 'Virgin Islands', abbreviation: 'V.I.', postalCode: 'VI' },
  { state: 'Washington', abbreviation: 'Wash.', postalCode: 'WA' },
  { state: 'West Virginia', abbreviation: 'W.Va.', postalCode: 'WV' },
  { state: 'Wisconsin', abbreviation: 'Wis.', postalCode: 'WI' },
  { state: 'Wyoming', abbreviation: 'Wyo.', postalCode: 'WY' }
];

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

export const congressForYear = function (year) { return Math.round(d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year)); };

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

export const getStateAbbr = function (state) {
  return stateAbbrs.find(s => s.state.toLowerCase() === state.toLowerCase()).postalCode;
};

export const getStateName = function (abbr) {
  return stateAbbrs.find(s => s.postalCode === abbr).state;
};

export const getStateAbbrLong = function (postalCode) {
  return stateAbbrs.find(s => s.postalCode === postalCode).abbreviation;
};

export const formatPersonName = function (name) {
  let formattedName;
  if (name.split(',').length <= 2) {
    let {
      first,
      middle,
      last,
      suffix
    } = parseFullName(name);
    if (middle == middle.toLowerCase()) {
      middle = `${middle.charAt(0).toUpperCase()}${middle.slice(1)}`; 
    }
    formattedName = [first, middle, last, suffix].join(' ');
  }
  return formattedName || name;
};
