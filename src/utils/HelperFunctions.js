import * as d3 from 'd3';
import { parseFullName } from 'parse-full-name';

import DistrictsStore from '../stores/Districts';

const repColor = '#FB6765';
const repColorLight = '#FACFCF';
const demColor = '#717EFF';
const demColorLight = '#D2D2F8';
const whigColor = '#FF7F50'; //'#D4C685';
const thirdColor = '#D4C685'; // '#98B9AB';
const equalColor = '#BEBEBE';
const stateAbbrs = [
  { state: 'Alabama', abbreviation: 'Ala.', postalCode: 'AL', fips: '001' },
  { state: 'Alaska', abbreviation: 'Alaska', postalCode: 'AK', fips: '002' },
  { state: 'Arizona', abbreviation: 'Ariz.', postalCode: 'AZ', fips: '004' },
  { state: 'Arkansas', abbreviation: 'Ark.', postalCode: 'AR', fips: '005' },
  { state: 'California', abbreviation: 'Calif.', postalCode: 'CA', fips: '006' },
  { state: 'Colorado', abbreviation: 'Colo.', postalCode: 'CO', fips: '008' },
  { state: 'Connecticut', abbreviation: 'Conn.', postalCode: 'CT', fips: '009' },
  { state: 'Delaware', abbreviation: 'Del.', postalCode: 'DE', fips: '010' },
  { state: 'District of Columbia', abbreviation: 'D.C.', postalCode: 'DC', fips: '011' },
  { state: 'Florida', abbreviation: 'Fla.', postalCode: 'FL', fips: '012' },
  { state: 'Georgia', abbreviation: 'Ga.', postalCode: 'GA', fips: '013' },
  { state: 'Guam', abbreviation: 'Guam', postalCode: 'GU', fips: '014' },
  { state: 'Hawaii', abbreviation: 'Hawaii', postalCode: 'HI', fips: '015' },
  { state: 'Idaho', abbreviation: 'Idaho', postalCode: 'ID', fips: '016' },
  { state: 'Illinois', abbreviation: 'Ill.', postalCode: 'IL', fips: '017' },
  { state: 'Indiana', abbreviation: 'Ind.', postalCode: 'IN', fips: '018' },
  { state: 'Iowa', abbreviation: 'Iowa', postalCode: 'IA', fips: '019' },
  { state: 'Kansas', abbreviation: 'Kans.', postalCode: 'KS', fips: '020' },
  { state: 'Kentucky', abbreviation: 'Ky.', postalCode: 'KY', fips: '021' },
  { state: 'Louisiana', abbreviation: 'La.', postalCode: 'LA', fips: '022' },
  { state: 'Maine', abbreviation: 'Maine', postalCode: 'ME', fips: '023' },
  { state: 'Maryland', abbreviation: 'Md.', postalCode: 'MD', fips: '024' },
  { state: 'Massachusetts', abbreviation: 'Mass.', postalCode: 'MA', fips: '025' },
  { state: 'Michigan', abbreviation: 'Mich.', postalCode: 'MI', fips: '026' },
  { state: 'Minnesota', abbreviation: 'Minn.', postalCode: 'MN', fips: '027' },
  { state: 'Mississippi', abbreviation: 'Miss.', postalCode: 'MS', fips: '028' },
  { state: 'Missouri', abbreviation: 'Mo.', postalCode: 'MO', fips: '029' },
  { state: 'Montana', abbreviation: 'Mont.', postalCode: 'MT', fips: '030' },
  { state: 'Nebraska', abbreviation: 'Nebr.', postalCode: 'NE', fips: '031' },
  { state: 'Nevada', abbreviation: 'Nev.', postalCode: 'NV', fips: '032' },
  { state: 'New Hampshire', abbreviation: 'N.H.', postalCode: 'NH', fips: '033' },
  { state: 'New Jersey', abbreviation: 'N.J.', postalCode: 'NJ', fips: '034' },
  { state: 'New Mexico', abbreviation: 'N.M.', postalCode: 'NM', fips: '035' },
  { state: 'New York', abbreviation: 'N.Y.', postalCode: 'NY', fips: '036' },
  { state: 'North Carolina', abbreviation: 'N.C.', postalCode: 'NC', fips: '037' },
  { state: 'North Dakota', abbreviation: 'N.D.', postalCode: 'ND', fips: '038' },
  { state: 'Ohio', abbreviation: 'Ohio', postalCode: 'OH', fips: '039' },
  { state: 'Oklahoma', abbreviation: 'Okla.', postalCode: 'OK', fips: '040' },
  { state: 'Oregon', abbreviation: 'Ore.', postalCode: 'OR', fips: '041' },
  { state: 'Pennsylvania', abbreviation: 'Pa.', postalCode: 'PA', fips: '042' },
  { state: 'Puerto Rico', abbreviation: 'P.R.', postalCode: 'PR', fips: '043' },
  { state: 'Rhode Island', abbreviation: 'R.I.', postalCode: 'RI', fips: '044' },
  { state: 'South Carolina', abbreviation: 'S.C.', postalCode: 'SC', fips: '045' },
  { state: 'South Dakota', abbreviation: 'S.D.', postalCode: 'SD', fips: '046' },
  { state: 'Tennessee', abbreviation: 'Tenn.', postalCode: 'TN', fips: '047' },
  { state: 'Texas', abbreviation: 'Tex.', postalCode: 'TX', fips: '048' },
  { state: 'Utah', abbreviation: 'Utah', postalCode: 'UT', fips: '049' },
  { state: 'Vermont', abbreviation: 'Vt.', postalCode: 'VT', fips: '050' },
  { state: 'Virginia', abbreviation: 'Va.', postalCode: 'VA', fips: '051' },
  { state: 'Virgin Islands', abbreviation: 'V.I.', postalCode: 'VI', fips: '052' },
  { state: 'Washington', abbreviation: 'Wash.', postalCode: 'WA', fips: '053' },
  { state: 'West Virginia', abbreviation: 'W.Va.', postalCode: 'WV', fips: '054' },
  { state: 'Wisconsin', abbreviation: 'Wis.', postalCode: 'WI', fips: '055' },
  { state: 'Wyoming', abbreviation: 'Wyo.', postalCode: 'WY', fips: '056' }
];

export const getDistrictStyleFromUi = function (district, ui) {
  const style = {};

  // set base color depending on winner/strength of victory view
  if (ui.winnerView
    || (ui.selectedView === 'cartogram' && ui.selectedDistrict !== district.id)) {
    style.fill = getColorForParty(district.regularized_party_of_victory);
  } else {
    const percentVote = (district.gtCount)
      ? district.percent_vote * district.gtCount
      : district.percent_vote;
    style.fill = getColorForMargin(district.regularized_party_of_victory, percentVote);
  }

  // set base opacity depending on map/cartogram view
  style.fillOpacity = (ui.selectedView === 'map') ? 1 : 0.1;
  style.strokeOpacity = (ui.selectedView === 'map') ? 1 : 0;

  // hide if not among selected party or selected flipped
  if ((ui.selectedParty
    && ui.selectedParty !== district.regularized_party_of_victory)
    || (ui.onlyFlipped && !district.flipped)) {
    style.fillOpacity = 0.01;
    style.strokeOpacity = 0;
  }

  // obscure if not selected district
  if (ui.selectedDistrict) {
    if (ui.selectedDistrict === district.id) {
      style.fillOpacity = 1;
      style.strokeOpacity = 1;
    } else {
      style.fillOpacity = 0.1;
      style.strokeOpacity = (ui.selectedView === 'map') ? 1 : 0;
    }
  }

  const hasNarrowStrokeWidth = !ui.selectedDistrict || ui.selectedDistrict !== district.id;
  style.strokeWidth = (hasNarrowStrokeWidth) ? 0.5 / ui.zoom : 2 / ui.zoom;

  style.pointerEvents = (ui.selectedView === 'map') ? 'auto' : 'none';

  style.stroke = '#eee';

  return style;
};

export const getBubbleStyle = function (district, ui) {
  const style = {};

  const {
    regularized_party_of_victory,
    percent_vote,
    districtId,
    flipped
  } = district;

  const {
    selectedView,
    winnerView,
    selectedParty,
    onlyFlipped,
    selectedDistrict
  } = ui;

  style.fillOpacity = (selectedView === 'cartogram') ? 1 : 0;

  if (selectedView === 'map') {
    style.fill = 'transparent';
    style.stroke = 'transparent';
  } else if (winnerView) {
    style.fill = getColorForParty(regularized_party_of_victory);
    style.stroke = getColorForParty(regularized_party_of_victory);
  } else {
    style.fill = getColorForMargin(regularized_party_of_victory, percent_vote);
    style.stroke = getColorForMargin(regularized_party_of_victory, percent_vote);
  }

  // change stroke of selected district to white
  if (selectedView === 'cartogram' && selectedDistrict && selectedDistrict === districtId) {
    style.stroke = 'white';
  }

  // hide if not among selected party or selected flipped
  if ((selectedParty && selectedParty !== regularized_party_of_victory) ||
   (onlyFlipped && !flipped)) {
    style.fillOpacity = 0.1;
  }
  // obscure if not selected district
  if (selectedDistrict && selectedDistrict !== districtId) {
    style.fillOpacity = 0.1;
  }

  style.pointerEvents = (selectedView === 'map') ? 'none' : 'auto';

  return style;
};

export const getCityBubbleStyle = function (city, ui) {
  const style = {};

  style.fillOpacity = (ui.selectedView === 'map') ? 0 : 0.5;

  if (ui.selectedView === 'cartogram') {
    if (ui.selectedParty) {
      const percentOfParty = DistrictsStore.cityPercentForParty(city.id, ui.selectedYear, ui.selectedParty);
      if (percentOfParty === 0) {
        style.fillOpacity = 0.2;
      }
    }

    if (ui.onlyFlipped) {
      const flippedPercent = DistrictsStore.cityFlippedPercent(city.id, ui.selectedYear);
      if (flippedPercent === 0) {
        style.fillOpacity = 0.2;
      }
    }

    if (ui.selectedDistrict && !DistrictsStore.districtInCity(DistrictsStore.getBubbleForDistrict(ui.selectedDistrict, ui.selectedYear), city)) {
      style.fillOpacity = 0.2;
    }
  }

  return style;
};

export const getCityBubbleLabelOpacity = function (city, ui) {
  let opacity = 1;

  if (ui.selectedView === 'map') {
    opacity = 0;
  } else {
    if (ui.selectedParty) {
      const percentOfParty = DistrictsStore.cityPercentForParty(city.id, ui.selectedYear, ui.selectedParty);
      opacity = percentOfParty;
    }

    if (ui.onlyFlipped) {
      const flippedPercent = DistrictsStore.cityFlippedPercent(city.id, ui.selectedYear);
      if (flippedPercent === 0) {
        opacity = 0.2;
      }
    }

    if (ui.selectedDistrict && !DistrictsStore.districtInCity(DistrictsStore.getBubbleForDistrict(ui.selectedDistrict, ui.selectedYear), city)) {
      opacity = 0.2;
    }
  }

  return opacity;
};

export const getStateStyle = function (state, ui) {
  const style = {
    fill: 'transparent',
    stroke: '#eee',
    strokeOpacity: (ui.selectedView === 'cartogram') ? 0.2 : 1,
    strokeWidth: (!ui.selectedDistrict || state.properties.abbr_name === DistrictsStore.getElectionDataForDistrict(ui.selectedYear, ui.selectedDistrict).state) ? 1.5 / ui.zoom : 0.3 / ui.zoom,
    pointerEvents: 'none'
  };

  return style;
};

export const getColorForParty = function (party) { return (!party) ? 'yellow' : (party.toLowerCase().includes('republican')) ? repColor : (party.toLowerCase().includes('democrat')) ? demColor : (party.toLowerCase().includes('whig')) ? whigColor : thirdColor; };

export const getColorForMargin = function (party, percent) {
  party = party || '';
  if (percent < 0) {
    return "transparent";
  }

  const repColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, repColor]);

  const demColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, demColor]);

  const whigColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, whigColor]);

  const thirdColorAdjustment = d3.scaleLinear()
    .domain([-1, 1])
    .range([equalColor, thirdColor]);

  const getRepColor = d3.scaleLinear()
    .domain([-1, 0.5, 0.55, 1])
    .range([equalColor, equalColor, repColorAdjustment(-0.2), repColor]);

  const getDemColor = d3.scaleLinear()
    .domain([-1, 0.5, 0.55, 1])
    .range([equalColor, equalColor, demColorAdjustment(-0.2), demColor]);

  const getWhigColor = d3.scaleLinear()
    .domain([-1, 0.5, 0.55, 1])
    .range([equalColor, equalColor, whigColorAdjustment(-0.2), whigColor]);

  const getThirdColor = d3.scaleLinear()
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

export const getFIPSToStateName = function (fips) {
  return (fips) ? stateAbbrs.find(s => s.fips === fips).state : null;
};

export const getStateAbbrLong = function (postalCode) {
  return stateAbbrs.find(s => s.postalCode === postalCode).abbreviation;
};

export const formatPersonName = function (name) {
  let formattedName;
  if (name && name.split(',').length <= 2) {
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
  return formattedName || name;
};
