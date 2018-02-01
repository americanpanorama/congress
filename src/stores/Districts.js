import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import CartoDBLoader from '../utils/CartoDBLoader';
import * as d3 from 'd3';

import { yearForCongress, congressForYear, getStateAbbr } from '../utils/HelperFunctions';

import bubbleXYs from '../../data/bubbleXYs.json';
import Elections from '../../data/elections.json';
import SpatialIds from '../../data/spatialids.json';
//import Districts from '../../data/congressional_districts.json';

import DimensionsStore from './DimensionsStore';


const DistrictsStore = {

  data: {
    bubbleCoords: [],
    districts: [],
    congressDistricts: {},
    theMap: null,
  },

  dataLoader: CartoDBLoader,

  loadDistrictsForCongress: function(year) {
    const congress = congressForYear(year);
    // load only if the congress hasn't been loaded yet 
    if (year && congress && !this.data.congressDistricts[congress]) {
      this.dataLoader.query([
        {
          query: "SELECT st_asgeojson(the_geom) as the_geojson, startcong, endcong, district, statename, id, st_area(the_geom::geography) * 0.0000003861 as area FROM districts where startcong <= " + congress + " and endcong >= " + congress,
          format: 'JSON'
        }
      ]).then((responses) => {
        this.data.congressDistricts[year] = [];
        responses[0].forEach(d => {
          d.the_geojson = JSON.parse(d.the_geojson);
          this.data.districts[d.id] = d;
          this.data.congressDistricts[year].push(d.id);
        });
        this.emit(AppActionTypes.storeChanged);
      });
    }
  },

  parseBubbles: function() {
    this.data.bubbleCoords = bubbleXYs.map(yearData => {
      return {
        year: yearData.year,
        districts: yearData.districts.filter(d => d.id).map((d, i) => {
          const state = d.district.substring(0,2),
            district = parseInt(d.district.substring(2)),
            regularized_party_of_victory = Elections[yearData.year][state][district].regularized_party_of_victory,
            previousDistrictId = this.getDistrictId(yearData.year - 2, SpatialIds[yearData.year][d.id]),
            previousDistrictNum = this.getDistrictNum(yearData.year - 2, previousDistrictId),
            flipped = !!(regularized_party_of_victory && previousDistrictId && Elections[yearData.year - 2] && Elections[yearData.year - 2][state] && Elections[yearData.year - 2][state][previousDistrictNum] && Elections[yearData.year - 2][state][previousDistrictNum].regularized_party_of_victory !== regularized_party_of_victory);
          return {
            id: SpatialIds[yearData.year][d.id] || 'missing' + yearData.year + i,
            x: d.x * DimensionsStore.getMapScale(),
            y: d.y * DimensionsStore.getMapScale(),
            xOrigin: d.xOrigin * DimensionsStore.getMapScale(),
            yOrigin: d.yOrigin * DimensionsStore.getMapScale(),
            state: state,
            regularized_party_of_victory: regularized_party_of_victory,
            percent_vote: Elections[yearData.year][state][district].percent_vote,
            flipped: flipped,
          };
        }),
        cities: yearData.cities.map(d => {
          return {
            id: d.id,
            x: d.x * DimensionsStore.getMapScale(),
            y: d.y * DimensionsStore.getMapScale(),
            xOrigin: d.xOrigin * DimensionsStore.getMapScale(),
            yOrigin: d.yOrigin * DimensionsStore.getMapScale(),
            r: d.r * DimensionsStore.getMapScale()
          };
        }),
      };
    });
    this.emit(AppActionTypes.storeChanged);
  },

  getPathFunction: function() { return d3.geoPath(this.getProjection()); },

  getPath: function(g) { return this.getPathFunction()(g); },

  getTheMap: function() { return this.data.theMap; },

  getVisibleBounds: function() { return this.data.theMap.getBounds(); },

  getProjection: function() {
    return d3.geoAlbersUsa()
      .scale(DimensionsStore.getMapScale())
      .translate([DimensionsStore.getDimensions().mapWidth/2, DimensionsStore.getDimensions().mapHeight/2]);
  },

  getBubbleCoords: function(year) { return this.data.bubbleCoords.find(bc => bc.year == year) || { districts: [], cities: [] }; },

  getElectionDistrictIds: function(year) { return this.data.bubbleCoords.find(bc => bc.year == year).districts.map(d => d.id); },

  getElectionDistricts: function(year) { 
    const districts = [],
      opacity = d3.scaleLinear().domain([0,10000,600000]).range([1,0.2,0.2]);
    Object.keys(this.data.districts).forEach(id => {
      if (this.data.congressDistricts[year] && this.data.congressDistricts[year].includes(id) && Elections[year][getStateAbbr(this.data.districts[id].statename)]) {
        let d = this.data.districts[id];
        d.regularized_party_of_victory = Elections[year][getStateAbbr(d.statename)][d.district].regularized_party_of_victory;
        d.percent_vote = Elections[year][getStateAbbr(d.statename)][d.district].percent_vote;
        d.opacity = opacity(d.area);
        districts.push(d);
      }
    });
    return districts;
  },

  getYears: function() { return this.data.bubbleCoords.map(yearData => yearData.year); },

  getDistrictId(year, spatialId)  {
    let districtId;
    if (SpatialIds[year]) {
      Object.keys(SpatialIds[year]).every(aDistrictId => {
        if (SpatialIds[year][aDistrictId] == spatialId) {
          districtId = aDistrictId;
          return false;
        }
        return true;
      });
    }
    return districtId;
  },

  getDistrictNum(year, spatialId) {
    if (!year || !spatialId) { return false; }
    let districtNum;
    const yearData = bubbleXYs.find(yearData => yearData.year == year);
    if (yearData && yearData.districts) {
      yearData.districts.every(d => {
        if (d.id == spatialId) {
          districtNum = d.district.substring(2);
          return false;
        }
        return true;
      });
    }
    return districtNum;
  },
}

// Mixin EventEmitter functionality
Object.assign(DistrictsStore, EventEmitter.prototype);

// Register callback to handle all updates
AppDispatcher.register((action) => {
  switch (action.type) {
    
    case AppActionTypes.loadInitialData:
      const year = action.hashState.year || action.state.selectedYear || null;

      DistrictsStore.parseBubbles();
      DistrictsStore.loadDistrictsForCongress(year);
      break;
    case AppActionTypes.congressSelected:
      DistrictsStore.loadDistrictsForCongress(action.year);
      break;
  }
  return true;
});

export default DistrictsStore;