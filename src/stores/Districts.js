import { EventEmitter } from 'events';
import * as d3 from 'd3';
import PointInSvgPolygon from 'point-in-svg-polygon';

import AppDispatcher from '../utils/AppDispatcher';
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';

import { getStateName, getStateAbbrLong } from '../utils/HelperFunctions';

import SteamgraphPaths from '../../data/steamgraphPaths.json';
import PartyCounts from '../../data/partyCounts.json';

import DimensionsStore from './DimensionsStore';

const DistrictsStore = {

  data: {
    elections: [],
    states: [],
    cityBubbles: [],
    spaceData: [],
    spatialIdExample: null
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
      .filter(e => (e.districtType !== 'GT' && (!e.id.includes('-') || e.id.includes('-0'))) && e.svg)
      .sort((e) => {
        if (['AL', 0, '0'].includes(e.districtType)) {
          return -1;
        }
        return 1;
      });
  },

  getElectionBubbles: function () { return this.data.elections; },

  getCityBubbles: function () { return this.data.cityBubbles; },

  getStates: function (year) { return this.data.states; },

  getGeneralTicketElections: function () {
    const gtElections = this.data.elections.filter(e => e.districtType === 'GT');
    const states = gtElections.map(e => e.state).filter((e, i, self) => self.indexOf(e) === i);
    return states.map(state => ({
      state: state,
      elections: gtElections.filter(e => e.state === state)
    }));
  },

  getSpaceData: function () { return this.data.spaceData; },

  getElectionDataForDistrict: function (spatialId) {
    return this.data.elections.find(e => parseInt(e.spatialId) === parseInt(spatialId));
  },

  getSteamgraphPaths: function () { return SteamgraphPaths; },

  getPartyCounts: function () { return PartyCounts; },

  getElectionYears: function () { return PartyCounts.map(yd => yd.year).sort(); },

  getEarliestYear: function () { return Math.min(...this.getElectionYears()); },

  getLastYear: function () { return Math.max(...this.getElectionYears()); },

  getPreviousElectionYear: function (year) {
    const electionYears = this.getElectionYears();
    const iCurrent = electionYears.indexOf(parseInt(year));
    return (iCurrent === 0) ? false : electionYears[iCurrent - 1];
  },

  getNextElectionYear: function (year) {
    const electionYears = this.getElectionYears();
    const iCurrent = electionYears.indexOf(parseInt(year));
    return (iCurrent + 1 === electionYears.length) ? false : electionYears[iCurrent + 1];
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

  getSearchData: function () {
    const searchOptions = [];
    this.data.elections.forEach((election) => {
      const {
        districtType,
        state,
        victor,
        party,
        partyReg,
        spatialId,
        id
      } = election;
      searchOptions.push({
        searchText: `${state} ${getStateName(state)} 
          ${districtType} ${victor} ${partyReg} ${(partyReg === 'third') ? party : ''}`,
        id: id,
        spatialId: spatialId,
        state: getStateName(state),
        stateAbbr: getStateAbbrLong(state),
        district: districtType,
        victor: victor,
        partyReg: partyReg
      });
    });

    return searchOptions;
  },

  getXYZForDistrict: function (id) {
    const { bounds } = this.getElectionDataForDistrict(id);
    return this.getXYZFromBounds(bounds);
  },

  getBoundsForDistrictAndBubble: function (id) {
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
    return [[minX, minY], [maxX, maxY]];
  },

  getXYXForDistrictAndBubble: function (id) {
    return this.getXYZFromBounds(this.getBoundsForDistrictAndBubble(id));
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

  getMaxTopOffset: function () {
    return Math.max(...PartyCounts.map(yd => yd.third / 2 + yd.democrat));
  },

  getMaxBottomOffset: function () {
    return Math.max(...PartyCounts.map(yd => yd.third / 2 + yd.republican));
  },

  getDistrictLabel: function (id) {
    const districtData = this.getElectionDataForDistrict(id);
    if (districtData) {
      const { state, districtType } = districtData;
      const stateAbbr = getStateAbbrLong(state);
      if (districtType === 'GT') {
        return `${stateAbbr} General Ticket`;
      } else if (['AL', '0', 0].includes(districtType)) {
        return `${stateAbbr} At Large`;
      }
      return `${stateAbbr} ${districtType}`;
    }
    return null;
  },

  hasThird: function () { return this.data.elections.map(e => e.partyReg).includes('third'); },

  hasGTElection: function () { return this.data.elections.map(e => e.districtType).includes('GT'); },

  findDistrict: function (point, year) {
    const project = d3.geoAlbersUsa().scale(1).translate([0, 0]);
    const projectedPoint = project(point);
    const candidates = this.data.elections.filter(e => (
      e.bounds && projectedPoint[0] >= e.bounds[0][0] && projectedPoint[0] <= e.bounds[1][0]
      && projectedPoint[1] >= e.bounds[0][1] && projectedPoint[1] <= e.bounds[1][1]
    ));
    const district = candidates.find(e => (
      e.svg && PointInSvgPolygon.isInside(projectedPoint, e.svg)
    ));
    return (district && district.spatialId) ? district.spatialId : false;
  },

  getPathFunction: function () { return d3.geoPath(this.getProjection()); },

  getPath: function (g) { return this.getPathFunction()(g); },

  getProjection: function () {
    return d3.geoAlbersUsa()
      .scale(DimensionsStore.getMapScale())
      .translate([DimensionsStore.getDimensions().mapProjectionWidth / 2,
        DimensionsStore.getDimensions().mapProjectionHeight / 2]);
  },

  projectPoint: function (point) { return this.getProjection()(point); },

  districtToSpatialId: function (districtId) {
    return this.data.elections.find(e => e.id === districtId).spatialId;
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
  };

  updates[AppActionTypes.congressSelected] = () => {
    DistrictsStore.loadForYear(parseInt(action.year));
  };

  updates[AppActionTypes.districtSelected] = () => {
    DistrictsStore.loadSpaceData(action.id);
  };

  if (updates[action.type]) {
    updates[action.type]();
  }

  return true;
});

export default DistrictsStore;
