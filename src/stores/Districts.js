import { EventEmitter } from 'events';
import * as d3 from 'd3';
import Polylabel from 'polylabel';
import GeojsonArea from '@mapbox/geojson-area';

import AppDispatcher from '../utils/AppDispatcher';
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';

import { congressForYear, getStateAbbr, getStateName, getStateAbbrLong, getFIPSToStateName } from '../utils/HelperFunctions';

import bubbleXYs from '../../data/bubbleXYs.json';
import Elections from '../../data/elections.json';
import SteamgraphPaths from '../../data/steamgraphPaths.json';
import SpatialIds from '../../data/spatialids.json';

import DimensionsStore from './DimensionsStore';

const DistrictsStore = {

  data: {
    bubbleCoords: [],
    districts: [],
    states: [],
    elections: [],
    cityBubbles: [],
    congressDistricts: {},
    theMap: null,
    rawPartyCounts: [],
    partyCounts: [],
    partyCountsKeys: [],
    congressYears: [],
    earliestYear: null,
    lastYear: null,
    spaceData: [],
    bubbles: []
  },

  loadForYear: function (year, districtId) {
    fetch(`static/elections/${year}.json`)
      .then((response) => {
        response.json().then((data) => {
          this.data.elections = data.elections;
          this.data.states = data.states;
          this.data.cityBubbles = data.cityBubbles;

          if (districtId) {
            this.loadSpaceData(districtId);
          }

          AppActions.congressLoaded(year);
        });
      });
  },

  loadSpaceData: function (spatialId) {
    //const { spatialId } = this.getElectionDataForDistrict(id);
    fetch(`static/space-data/${spatialId}.json`)
      .then((response) => {
        response.json().then((data) => {
          this.data.spaceData = data;

          this.emit(AppActionTypes.storeChanged);
        });
      });
  },

  getElectionDistricts: function (year) {
    return this.data.elections
      .filter(e => (!e.id.includes('-') || e.id.includes('-0')) && e.svg)
      .sort((e) => {
        if (['GT', 'AL', 0, '0'].includes(e.districtType)) {
          return -1;
        }
        return 1;
      });
  },

  getElectionBubbles: function () { return this.data.elections; },

  getCityBubbles: function () { return this.data.cityBubbles; },

  getStates: function (year) { return this.data.states; },

  getSpaceData: function () { return this.data.spaceData; },

  getElectionDataForDistrict: function (spatialId) {
    return this.data.elections.find(e => parseInt(e.spatialId) === parseInt(spatialId));
  },

  getSteamgraphPaths: function () {
    return SteamgraphPaths;
  },

  hasYearLoaded: function (year) { return this.data.congressDistricts[year] && this.data.congressDistricts[year].length > 0; },

  getPartyCounts: function () { return this.data.partyCounts; },

  getCongressYears: function () { return this.data.congressYears; },

  getPathFunction: function () { return d3.geoPath(this.getProjection()); },

  getPath: function (g) { return this.getPathFunction()(g); }, 

  getProjection: function () {
    return d3.geoAlbersUsa()
      .scale(DimensionsStore.getMapScale())
      .translate([DimensionsStore.getDimensions().mapProjectionWidth / 2,
        DimensionsStore.getDimensions().mapProjectionHeight / 2]);
  },

  getEarliestYear: function () {
    return 1836;
    // if (!this.data.earliestYear) {
    //   this.data.earliestYear = Math.min(this.data.elections.map(e => e.year))
    //     .map(y => parseInt(y, 10)));
    // }
    // return this.data.earliestYear;
  },

  getLastYear: function () {
    return 2010;
    // if (!this.data.lastYear) {
    //   this.data.lastYear = Math.max(this.data.elections.map(e.))
    //     .map(y => parseInt(y, 10)));
    // }
    // return this.data.lastYear;
  },

  getElectionYears: function () {
    return Array(this.getLastYear() -  this.getEarliestYear() + 1).fill().map((_, idx) => this.getEarliestYear() + idx);
    // return Object.keys(this.data.elections)
    //   .map(y => parseInt(y, 10))
    //   .sort();
  },

  projectPoint: function (point) { return this.getProjection()(point); },

  cityHasParty: function (cityId, year, party) {
    let hasParty = false;
    const cityBubble = this.getBubbleCoords(year).cities.find(c => c.id === cityId);
    this.getBubbleCoords(year).districts.forEach((d) => {
      if (this.districtInCity(d, cityBubble) && d.partyReg === party) {
        hasParty = true;
      }
    });
    return hasParty;
  },

  cityPercentForParty: function (cityId, year, party) {
    let districtCount = 0;
    let partyCount = 0;
    const cityBubble = this.getBubbleCoords(year).cities.find(c => c.id === cityId);
    this.getBubbleCoords(year).districts.forEach((d) => {
      if (this.districtInCity(d, cityBubble)) {
        districtCount += 1;
        if (d.partyReg === party) {
          partyCount += 1;
        }
      }  
    });
    return partyCount / districtCount;
  },

  cityFlippedPercent: function (cityId, year) {
    let districtCount = 0;
    let flippedCount = 0;
    const cityBubble = this.getBubbleCoords(year).cities.find(c => c.id === cityId);
    this.getBubbleCoords(year).districts.forEach((d, i) => {
      if (this.districtInCity(d, cityBubble)) {
        districtCount += 1;
        if (d.flipped) {
          flippedCount += 1;
        }
      }  
    });
    return flippedCount / districtCount;
  },

  getDistrictsForState: function (state) {
    return this.data.elections
      .filter(e => e.state === state)
      .sort((a, b) => {
        if (a.districtType === 'GT' && b.districtType !== 'GT') {
          return -1;
        }
        if (a.districtType !== 'GT' && b.districtType === 'GT') {
          return 1;
        }
        if (a.districtType === 'AL' && b.districtType !== 'AL') {
          return -1;
        }
        if (a.districtType !== 'AL' && b.districtType === 'AL') {
          return 1;
        }
        return parseInt(a.districtType) - parseInt(b.districtType);
      });
  },

  getStatePreviousDistrictId: function (id) {
    const { state } = this.getElectionDataForDistrict(id);
    const stateDistricts = this.getDistrictsForState(state);
    const i = stateDistricts.findIndex(e => e.spatialId === id);
    return (i > 0) ? stateDistricts[i - 1].spatialId : false;
  },

  getStateNextDistrictId: function (id) {
    const { state } = this.getElectionDataForDistrict(id);
    const stateDistricts = this.getDistrictsForState(state);
    const i = stateDistricts.findIndex(e => e.spatialId === id);
    return (i + 1 < stateDistricts.length) ? stateDistricts[i + 1].spatialId : false;
  },

  getDistrictIdFromStateDistrict: function (abbr) {
    let nextId = false;
    const yearData = bubbleXYs.find(yd => yd.year === year);
    if (yearData && yearData.districts) {
      const nextDistrict = yearData.districts.find(d => d.district === abbr);
      if (nextDistrict) {
        nextId = nextDistrict.id;
      }
    }
    return nextId;
  },

  districtInCity: function (districtBubble, cityBubble) {
    const xDiff = cityBubble.x - districtBubble.x;
    const yDiff = cityBubble.y - districtBubble.y;
    return cityBubble.r >= Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  },

  getSearchData: function (year) {
    const searchOptions = [];
    this.data.elections.forEach((election) => {
      const {
        districtType,
        state,
        victor,
        partyReg,
        id
      } = election;
      if (districtType !== 'GT') {
        searchOptions.push({
          searchText: `${state} ${getStateName(state)} 
            ${districtType} ${victor} ${partyReg}`,
          id: id,
          state: getStateName(state),
          stateAbbr: getStateAbbrLong(state),
          district: districtType,
          victor: victor,
          partyReg: partyReg
        });
      }
    });

    return searchOptions;
  },

  getGeneralTicketElections: function (year) {
    return [];
    const generalTicket = [];
    elections.forEach((election) => {
      const {
        districtType,
        id,
        xOrigin,
        yOrigin
      } = election;
      if (districtType === 'GT') {
        const theBubble = this.getBubbleForDistrict(`${id}-0`, year);
        const centroid = [xOrigin, yOrigin];
        //const theGeoJson = (this.data.districts[id]) ? this.data.districts[id].the_geojson : null;
        let labelXY;
        let iOfLargest = 0;
        if (theGeoJson) {
          if (theGeoJson.type === 'MultiPolygon') {
            let largest = 0;
            theGeoJson.coordinates.forEach((coordinates, i) => {
              const area = GeojsonArea.geometry({ type: 'Polygon', coordinates: coordinates });
              if (area > largest) {
                iOfLargest = i;
                largest = area;
              }
            });
          }
          const theCoords = (theGeoJson.type === 'MultiPolygon') ? theGeoJson.coordinates[iOfLargest] : theGeoJson.coordinates;
          const labelCoords = Polylabel(theCoords, 0.1);
          labelXY = this.projectPoint([labelCoords[0], labelCoords[1]]);
        }
        // add the number of seats to the each election record--needed to adjust percent viz
        elections[state].GT = elections[state].GT.map(e => Object.assign({ gtCount: elections[state].GT.length }, e));
        generalTicket.push({
          state: state,
          id: id,
          centroid: labelXY || centroid,
          the_geojson: theGeoJson,
          elections: elections[state].GT
        });
      }
    });
    return generalTicket;
  },

  getRegPOVForDistrict: function (year, id) {
    const district = this.data.districts[id];
    if (district) {
      const stateAbbr = getStateAbbr(district.statename);
      const elections = this.data.elections[year];
      return (elections && elections[stateAbbr] && elections[stateAbbr][district.district]) ?
        elections[stateAbbr][district.district].partyReg : null;
    }
    return null;
  },

  districtFlipped: function (year, id) {
    const previousDistrictId = this.getDistrictId(year - 2, SpatialIds[year][id]);
    const currentParty = this.getRegPOVForDistrict(year, id);
    const previousParty = this.getRegPOVForDistrict(year - 2, previousDistrictId);
    return (!!currentParty && !!previousParty && currentParty !== previousParty);
  },

  isGeneralTicketElection: function (year, id) {
    const district = this.data.districts[id];
    console.log(this.getElectionDataForDistrict(year, id).district);
  },

  getXYZForDistrict: function (id) {
    const { bounds } = this.getElectionDataForDistrict(id);
    return this.getXYZFromBounds(bounds);
  },

  getXYXForDistrictAndBubble: function (id) {
    const {
      x,
      y,
      bounds
    } = this.getElectionDataForDistrict(id);
    const { districtR } = DimensionsStore.getDimensions();
    const minX = Math.min(bounds[0][0], x - districtR);
    const maxX = Math.max(bounds[1][0], x + districtR);
    const minY = Math.min(bounds[0][1], y - districtR);
    const maxY = Math.max(bounds[1][1], y + districtR);
    return this.getXYZFromBounds([[minX, minY], [maxX, maxY]]);
  },

  getXYZFromBounds: function (bounds) {
    const {
      mapScale,
      mapProjectionWidth,
      mapProjectionHeight,
      mapWidth,
      mapHeight
    } = DimensionsStore.getDimensions();
    const center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
    const x = (center[0] * mapScale + mapProjectionWidth / 2) / mapProjectionWidth;
    const y = (center[1] * mapScale + mapProjectionHeight / 2) / mapProjectionHeight;

    // calculate the highest zoom level that doesn't expand beyond the bounding box
    const maxHorizontal = (bounds[1][0] - bounds[0][0]) * mapScale;
    let zHorizontal = 1;
    while (maxHorizontal * zHorizontal < mapWidth / 2) {
      zHorizontal *= 1.62;
    }
    const maxVertical = (bounds[1][1] - bounds[0][1]) * mapScale;
    let zVertical = 1;
    while (maxVertical * zVertical < mapHeight / 2) {
      zVertical *= 1.62;
    }
    const z = Math.round(Math.min(zHorizontal, zVertical) / 1.62 * 100) / 100;
    return {
      x: x,
      y: y,
      z: z
    };
  },

  getYears: function() { return Object.keys(Elections).map(y => parseInt(y)); },

  getPreviousElectionYear: function(year) { 
    const electionYears = this.getYears(),
      iCurrent = electionYears.indexOf(parseInt(year));
    return (iCurrent === 0) ? false : electionYears[iCurrent-1];
  },

  getNextElectionYear: function(year) { 
    const electionYears = this.getYears(),
      iCurrent = electionYears.indexOf(parseInt(year));
    return (iCurrent + 1 === electionYears.length) ? false : electionYears[iCurrent+1];
  },

  getDistrictId(year, spatialId)  {
    let districtId = null;
    if (SpatialIds[year]) {
      Object.keys(SpatialIds[year]).every(aDistrictId => {
        if (SpatialIds[year][aDistrictId] === spatialId) {
          districtId = aDistrictId;
          return false;
        }
        return true;
      });
    }
    return districtId;
  },

  getRawPartyCounts: function (year) { return (year) ? this.data.rawPartyCounts.find(pc => pc.year === year) : this.data.rawPartyCounts; },

  getPartyCountsKeys() { return this.data.partyCountsKeys; },

  getPartyCountForYearAndParty: function (year, party) {
    return Object.keys(Elections[year]).reduce((accumulator, state) => {
        return accumulator + Object.keys(Elections[year][state]).reduce((accumulator2, districtNum) => {
          return accumulator2 + ((Elections[year][state][districtNum].partyReg === party) ? 1 : 0) 
        }, 0);
      }, 0);
  },

  getMaxTopOffset() { return Math.max(...this.data.rawPartyCounts.map(yd => yd.thirdCount/2 + yd.demBelowMargin + yd.demAboveMargin)); },

  getMaxBottomOffset() { return Math.max(...this.data.rawPartyCounts.map(yd => yd.thirdCount/2 + yd.repBelowMargin + yd.repAboveMargin)); },

  parseRawPartyCounts: function () {
    const counts = [];
    Object.keys(Elections).forEach((year) => {
      if (year !== 'NaN') {
        this.data.congressYears.push(parseInt(year));

        const repCount = this.getPartyCountForYearAndParty(year, 'republican');
        const whigCount = this.getPartyCountForYearAndParty(year, 'whig');
        const demCount = this.getPartyCountForYearAndParty(year, 'democrat');

        const demAboveMargin = (year < 1856) ? Math.max(demCount - whigCount, 0) :
          Math.max(demCount - repCount, 0);
        const demBelowMargin = (demAboveMargin <= 0) ? demCount : demCount - demAboveMargin;

        const repAboveMargin = Math.max(repCount - demCount, 0);
        const repBelowMargin = (repAboveMargin > 0) ? repCount - repAboveMargin : repCount;

        const whigAboveMargin = (whigCount > demCount) ? whigCount - demCount : 0;
        const whigBelowMargin = (whigAboveMargin > 0) ? whigCount - whigAboveMargin : whigCount;

        const thirdCount = this.getPartyCountForYearAndParty(year, 'third');

        counts.push({
          year: parseInt(year),
          demAboveMargin: demAboveMargin,
          demBelowMargin: demBelowMargin,
          thirdCount: thirdCount,
          whigBelowMargin: whigBelowMargin,
          repBelowMargin: repBelowMargin,
          whigAboveMargin: whigAboveMargin,
          repAboveMargin: repAboveMargin
        });
      }
    });

    this.data.rawPartyCounts = counts;
  },

  parsePartyCounts: function () {
    const stack = d3.stack()
      .keys(['demAboveMargin', 'demBelowMargin', 'thirdCount', 'whigBelowMargin', 'repBelowMargin', 'whigAboveMargin', 'repAboveMargin']);

    // calculate preliminary steamgraph values
    let stackedData = stack(this.data.rawPartyCounts);

    // recalculate to offset democrats up and republicans and whigs down
    stackedData.forEach((partyCounts, i) => {
      partyCounts.forEach((stackData, j) => {
        const formulas0 = {
          demAboveMargin: () => -1 * (stackData.data.demAboveMargin + stackData.data.demBelowMargin + stackData.data.thirdCount / 2),
          demBelowMargin: () => -1 * (stackData.data.demBelowMargin + stackData.data.thirdCount / 2),
          thirdCount: () => -1 * (stackData.data.thirdCount / 2),
          repBelowMargin: () => stackData.data.thirdCount / 2,
          whigBelowMargin: () => stackData.data.thirdCount / 2,
          repAboveMargin: () => 0,
          whigAboveMargin: () => 0
        };
        const formulas1 = {
          demAboveMargin: () => 0,
          demBelowMargin: () => -1 * (stackData.data.thirdCount / 2),
          thirdCount: () => stackData.data.thirdCount / 2,
          repBelowMargin: () => stackData.data.thirdCount / 2 + stackData.data.repBelowMargin,
          whigBelowMargin: () => stackData.data.thirdCount / 2 + stackData.data.whigBelowMargin,
          repAboveMargin: () => stackData.data.thirdCount / 2 + stackData.data.repBelowMargin + stackData.data.repAboveMargin,
          whigAboveMargin: () => stackData.data.thirdCount / 2 + stackData.data.whigBelowMargin + stackData.data.whigAboveMargin
        };
        const coords = [formulas0[partyCounts.key](), formulas1[partyCounts.key]()];
        coords.data = stackData.data;
        stackedData[i][j] = coords;
      });
    });

    // split the margins into separate series
    const demMajorityYears = stackedData[0]
      .filter(yd => yd.data.demAboveMargin > 0)
      .map(yd => yd.data.year);
    const demStartYears = demMajorityYears
      .filter((year, i) => i === 0 || !demMajorityYears.includes(year - 2));
    const demEndYears = demMajorityYears
      .filter((year, i) => i === demMajorityYears.length - 1 || !demMajorityYears.includes(year + 2));
    const demSpans = demStartYears.map((sy, i) => [sy, demEndYears[i]]);
    const demSeries = [];
    demSpans.forEach((span) => {
      const startIndex = stackedData[0].findIndex(yd => yd.data.year === span[0]);
      const endIndex = stackedData[0].findIndex(yd => yd.data.year === span[1]);
      const aDemSeries = stackedData[0].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
      demSeries.push(aDemSeries);
    });

    const repMajorityYears = stackedData[6]
      .filter(yd => yd.data.repAboveMargin > 0)
      .map(yd => yd.data.year);
    const repStartYears = repMajorityYears
      .filter((year, i) => i === 0 || !repMajorityYears.includes(year - 2));
    const repEndYears = repMajorityYears
      .filter((year, i) => i === repMajorityYears.length -1 || !repMajorityYears.includes(year + 2));
    const repSpans = repStartYears.map((sy, i) => [sy, repEndYears[i]]);
    const repSeries = [];
    repSpans.forEach((span) => {
      const startIndex = stackedData[6].findIndex(yd => yd.data.year === span[0]);
      const endIndex = stackedData[6].findIndex(yd => yd.data.year === span[1]);
      const aRepSeries = stackedData[6].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
      repSeries.push(aRepSeries);
    });

    const whigMajorityYears = stackedData[5].filter(yd => yd.data.whigAboveMargin > 0).map(yd => yd.data.year);
    const whigStartYears = whigMajorityYears.filter((year, i) => i === 0 || !whigMajorityYears.includes(year - 2));
    const whigEndYears = whigMajorityYears.filter((year, i) => i === whigMajorityYears.length -1 || !whigMajorityYears.includes(year + 2));
    const whigSpans = whigStartYears.map((sy, i) => [sy, whigEndYears[i]]);
    const whigSeries = [];
    whigSpans.forEach((span) => {
      const startIndex = stackedData[5].findIndex(yd => yd.data.year === span[0]);
      const endIndex = stackedData[5].findIndex(yd => yd.data.year === span[1]);
      const aWhigSeries = stackedData[5].slice(startIndex, (startIndex === endIndex) ? endIndex + 2 : endIndex + 1);
      whigSeries.push(aWhigSeries);
    });

    stackedData.splice(5, 2);
    stackedData.splice(0, 1);
    stackedData = repSeries.concat(stackedData);
    stackedData = whigSeries.concat(stackedData);
    stackedData = demSeries.concat(stackedData);
    this.data.partyCounts = stackedData;

    demSeries.forEach(ds => this.data.partyCountsKeys.push('demAboveMargin'));
    whigSeries.forEach(ds => this.data.partyCountsKeys.push('whigAboveMargin'));
    repSeries.forEach(ds => this.data.partyCountsKeys.push('repAboveMargin'));
    this.data.partyCountsKeys.push('demBelowMargin');
    this.data.partyCountsKeys.push('thirdCount');
    this.data.partyCountsKeys.push('whigBelowMargin');
    this.data.partyCountsKeys.push('repBelowMargin');
  },

  getSpatialIdData: function (spatialId) {
    const areaData = {};
    for (let y = 1836; y <= 2010; y += 2) {
      const districtId = this.getDistrictId(y, spatialId);
      const districtData = this.getElectionDataForDistrict(y, districtId);
      if (districtData) {
        areaData[y] = districtData;
      }
    }
    return areaData;
  },

  getDistrictLabel: function (id) {
    const districtData = this.getElectionDataForDistrict(id);
    if (districtData) {
      const { state, districtType } = districtData;
      const stateAbbr = getStateAbbrLong(state);
      return (['GT', 'AL', '0', 0].includes(districtType)) ? `${stateAbbr} At Large` : `${stateAbbr} ${districtType}`;
    }
    return null;
  },

  findDistrict: function (point, year) {
    const theStateGeoJson = this.data.states
      .filter(state => state.properties.abbr_name !== 'VA' || state.properties.year !== 1788)
      .find(state => d3.geoContains(state, point));
    if (theStateGeoJson) {
      // some stuff for VA and WV
      const stateAbbr = (theStateGeoJson.properties.abbr_name === 'WV' && year < 1864) ? 'VA' : theStateGeoJson.properties.abbr_name;
      const theDistrict = DistrictsStore.getElectionDistricts(year)
        .filter(dist => dist.statename === getStateName(stateAbbr))
        .find(dist => d3.geoContains(dist.the_geojson, point));
      if (theDistrict) {
        return theDistrict.id;
      }
    }
    return false;
  }

};

// Mixin EventEmitter functionality
Object.assign(DistrictsStore, EventEmitter.prototype);

// Register callback to handle all updates
AppDispatcher.register((action) => {
  const updates = {};

  updates[AppActionTypes.loadInitialData] = () => {
    const year = action.hashState.year || action.state.selectedYear || null;
    const districtId = action.hashState.district || action.state.selectedDistrict || null;

    DistrictsStore.loadForYear(parseInt(year), districtId);
    //DistrictsStore.loadDistrictsForCongress(year);
    //DistrictsStore.parseBubbles();
    DistrictsStore.parseRawPartyCounts();
    DistrictsStore.parsePartyCounts();
  };

  updates[AppActionTypes.congressSelected] = () => {
    DistrictsStore.loadForYear(parseInt(action.year));
  };

  updates[AppActionTypes.districtSelected] = () => {
    DistrictsStore.loadSpaceData(action.id);
  };

  // updates[AppActionTypes.windowResized] = () => {
  //   DistrictsStore.parseBubbles();
  // };

  if (updates[action.type]) {
    updates[action.type]();
  }

  return true;
});

export default DistrictsStore;
