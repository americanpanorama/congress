import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import * as topojson from 'topojson-client';
import * as d3 from 'd3';

import { yearForCongress, congressForYear, getStateAbbr } from '../utils/HelperFunctions';

import bubbleXYs from '../../data/bubbleXYs.json';
import Elections from '../../data/elections.json';
import SpatialIds from '../../data/spatialids.json';
import StatesTopoJson from '../../data/states.json';
import Slivers from '../../data/sliversTJ.json';
//import Districts from '../../data/congressional_districts.json';

import DimensionsStore from './DimensionsStore';


const DistrictsStore = {

  data: {
    bubbleCoords: [],
    districts: [],
    states:[],
    elections: Elections,
    congressDistricts: {},
    theMap: null,
    rawPartyCounts: [],
    partyCounts: [],
    congressYears: [],
    slivers: []
  },

  loadDistrictsForCongress: function(year) {
    const congress = congressForYear(year);
    this.data.congressDistricts[year] = this.data.congressDistricts[year] || [];

    fetch('static/districts-topojson/' + congress + '.json')
      .then(
        (response) => {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }

          // Examine the text in the response
          response.json().then((data) => {
            data.objects = {
              type: 'GeometryCollection',
              geometries: Object.keys(data.objects).map(k => data.objects[k])
            };
            const theGeoJson = topojson.feature(data, data.objects);
            theGeoJson.features.forEach(d => {
              this.data.districts[d.properties.id] = {
                id: d.properties.id,
                statename: d.properties.statename,
                district: d.properties.district,
                startcong: d.properties.startcong,
                endcong: d.properties.endcong,
                the_geojson: d.geometry
              };
              this.data.congressDistricts[year].push(d.properties.id);
            });

            this.emit(AppActionTypes.storeChanged);
          });
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      });    
  },

  parseStates: function() { 
    console.log(Slivers);
    Slivers.objects = {
      type: 'GeometryCollection',
      geometries: Object.keys(Slivers.objects).map(k => Slivers.objects[k])
    };
    console.log(Slivers);
    const theGeoJson = topojson.feature(Slivers, Slivers.objects);
    this.data.slivers = theGeoJson;

    this.data.states = topojson.feature(StatesTopoJson, StatesTopoJson.objects.states).features; 
    this.emit(AppActionTypes.storeChanged);
  },

  parseBubbles: function() {
    this.data.bubbleCoords = bubbleXYs
      .map(yearData => {
        return {
          year: yearData.year,
          districts: yearData.districts
            .filter(d => d.id)
            .map((d, i) => {
              const state = d.district.substring(0,2),
                district = parseInt(d.district.substring(2));
              if (!Elections[yearData.year][state][district]) {
                return;
              }
              const regularized_party_of_victory = Elections[yearData.year][state][district].regularized_party_of_victory,
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
                district: district,
                districtId: d.id,
                regularized_party_of_victory: regularized_party_of_victory,
                percent_vote: Elections[yearData.year][state][district].percent_vote,
                flipped: flipped,
              };
            })
            .sort((a,b) => (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0),
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

  hasYearLoaded: function(year) { return this.data.congressDistricts[year] && this.data.congressDistricts[year].length > 0; },

  getPartyCounts: function() { return this.data.partyCounts; },

  getCongressYears: function() { return this.data.congressYears; },

  getPathFunction: function() { return d3.geoPath(this.getProjection()); },

  getPath: function(g) { return this.getPathFunction()(g); },

  getTheMap: function() { return this.data.theMap; },

  getVisibleBounds: function() { return this.data.theMap.getBounds(); },

  getProjection: function() {
    console.log(d3.geoAlbersUsa().scale);
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
      if (this.data.congressDistricts[year] && this.data.congressDistricts[year].includes(id) && Elections[year][getStateAbbr(this.data.districts[id].statename)] && Elections[year][getStateAbbr(this.data.districts[id].statename)][this.data.districts[id].district]) {
        let d = this.data.districts[id];
        d.regularized_party_of_victory = Elections[year][getStateAbbr(d.statename)][d.district].regularized_party_of_victory;
        d.percent_vote = Elections[year][getStateAbbr(d.statename)][d.district].percent_vote;
        d.opacity = opacity(d.area);
        districts.push(d);
      }
    });
    return districts;
  },

  getElectionDataForDistrict: function(year, id) {
    const yearData = this.data.bubbleCoords.find(d => parseInt(d.year) == parseInt(year));
    return (yearData) ? yearData.districts.find(d => d.districtId == id) : false;
  },

  getYears: function() { return Object.keys(Elections).map(y => parseInt(y)); },

  getPreviousElectionYear: function(year) { 
    const electionYears = this.getYears(),
      iCurrent = electionYears.indexOf(parseInt(year));
    return (iCurrent == 0) ? false : electionYears[iCurrent-1];
  },

  getNextElectionYear: function(year) { 
    const electionYears = this.getYears(),
      iCurrent = electionYears.indexOf(parseInt(year));
    return (iCurrent + 1 == electionYears.length) ? false : electionYears[iCurrent+1];
  },

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

  getPartyDistributionByState(year) {
    if (Elections[year]) {
      let dist = {};
      Object.keys(Elections[year]).forEach(state => {
        Object.keys(Elections[year][state]).forEach(district => {
          const party = (Elections[year][state][district].regularized_party_of_victory == 'Republican' || Elections[year][state][district].regularized_party_of_victory == 'Democrat') ? Elections[year][state][district].regularized_party_of_victory : 'Third';
          dist[state] = dist[state] || {};
          dist[state][party] = dist[state][party] = dist[state][party] + 1 || 1;
        })
      });
      return dist;
    }
  },

  getPartyDistributionByStateOrganized(year) {
    let dist = this.getPartyDistributionByState(year),
      organized = [];
    if (dist) {
      let theMax = Math.max(...Object.keys(dist).map((state) => Math.max(...Object.keys(dist[state]).map(party => dist[state][party]))));
      theMax = 35;
      //console.log(Math.max(...Object.keys(dist.NY).map(party => dist.NY[party])));
      organized = Object.keys(dist).map(state => {
        return {
          state: state,
          dist: dist[state],
          demStrength: (dist[state].Democrat || 0) - (dist[state].Republican || 0)
        };
      });

      // sort
      organized = organized.sort((a,b) => {
        if (a.demStrength > b.demStrength) {
          return -1;
        } else if (a.demStrength < b.demStrength) {
          return 1;
        } else if ((a.dist.Democrat || 0) /((a.dist.Republican || 0) + (a.dist.Democrat || 0)) > (b.dist.Democrat || 0) /((b.dist.Republican || 0) + (b.dist.Democrat || 0))) {
          return -1;
        } else if ((a.dist.Democrat || 0) /((a.dist.Republican || 0) + (a.dist.Democrat || 0)) < (b.dist.Democrat || 0) /((b.dist.Republican || 0) + (b.dist.Democrat || 0))) {
          return 1;
        }
        return 0;
      });

      // calculate x offset and bar heights
      organized = organized.map((stateData, i) => {
        stateData.x = 20 * i;
        stateData.heightThird = (DimensionsStore.getDimensions().infoHeight / 2) * (stateData.dist.Third || 0) / theMax;
        stateData.heightDem = (DimensionsStore.getDimensions().infoHeight / 2) * (stateData.dist.Democrat || 0) / theMax;
        stateData.heightRep = (DimensionsStore.getDimensions().infoHeight / 2) * (stateData.dist.Republican || 0) / theMax;
        stateData.yThird = (DimensionsStore.getDimensions().infoHeight / 2) - stateData.heightThird / 2;
        stateData.yDem = stateData.yThird - stateData.heightDem;
        stateData.yRep = stateData.yThird + stateData.heightThird;
        return stateData;
      });
      return organized;
    }
  },

  getRawPartyCounts(year) { return (year) ? this.data.rawPartyCounts.find(pc => pc.year == year) : this.data.rawPartyCounts; },

  getStates(year) { return this.data.states.filter(state => state.properties.year <= year && !(year >= 1863 && state.properties.name == 'Virginia' && state.properties.year == 1864)); },

  getPartyCountForYearAndParty(year, party) {
    return Object.keys(Elections[year]).reduce((accumulator, state) => {
        return accumulator + Object.keys(Elections[year][state]).reduce((accumulator2, districtNum) => {
          return accumulator2 + ((Elections[year][state][districtNum].regularized_party_of_victory == party) ? 1 : 0) 
        }, 0);
      }, 0);
  },

  getMaxTopOffset() { return Math.max(...this.data.rawPartyCounts.map(yd => yd.thirdCount/2 + yd.demBelowMargin + yd.demAboveMargin)); },

  getMaxBottomOffset() { return Math.max(...this.data.rawPartyCounts.map(yd => yd.thirdCount/2 + yd.repBelowMargin + yd.repAboveMargin)); },

  parseRawPartyCounts() {
    let counts = [];
    Object.keys(Elections).map(year => {
      if (year != 'NaN') {
        this.data.congressYears.push(parseInt(year));
        const repCount = this.getPartyCountForYearAndParty(year, 'republican'),
          demCount = this.getPartyCountForYearAndParty(year, 'democrat'),
          repAboveMargin =  repCount - demCount; 
        // var yearData = {
        //   year: parseInt(year),
        //   demBelowMargin: (repAboveMargin >= 0) ? demCount : demCount + repAboveMargin,
        //   thirdCount: this.getPartyCountForYearAndParty(year, 'third'),
        //   repBelowMargin: (repAboveMargin <= 0) ? repCount : repCount - repAboveMargin,
        // };
        // if (repAboveMargin < 0) {
        //   yearData.demAboveMargin = repAboveMargin * -1;
        // } else if (repAboveMargin > 0) {
        //   yearData.repAboveMargin = repAboveMargin;
        // }
        // counts.push(yearData);
        counts.push({
          year: parseInt(year),
          demAboveMargin: (repAboveMargin < 0) ? repAboveMargin * -1 : 0,
          demBelowMargin: (repAboveMargin >= 0) ? demCount : demCount + repAboveMargin,
          thirdCount: this.getPartyCountForYearAndParty(year, 'third'),
          repBelowMargin: (repAboveMargin <= 0) ? repCount : repCount - repAboveMargin,
          repAboveMargin: (repAboveMargin > 0) ? repAboveMargin : 0,
        });
      }
    });
    this.data.rawPartyCounts = counts;
  },

  parsePartyCounts() {
    function offset(series, order) {
      series.forEach(partyCounts => {
        if (partyCounts.key == 'demAboveMargin') {
          partyCounts = partyCounts.map((stackData,i) => {
            stackData[0] = -1 * (stackData.data.demAboveMargin + stackData.data.demBelowMargin + stackData.data.thirdCount/2);
            // a little hacky, but set this to zero so that you can prevent gaps between curves that don't match because they don't share all points
            stackData[1] = 0; //-1 * (stackData.data.demBelowMargin + stackData.data.thirdCount/2);
          });
        }
        if (partyCounts.key == 'demBelowMargin') {
          partyCounts = partyCounts.map(stackData => {
            stackData[0] = -1 * (stackData.data.demBelowMargin + stackData.data.thirdCount/2);
            stackData[1] = -1 * (stackData.data.thirdCount/2);
          });
        }
        if (partyCounts.key == 'thirdCount') {
          partyCounts = partyCounts.map(stackData => {
            stackData[0] = -1 * (stackData.data.thirdCount/2);
            stackData[1] = stackData.data.thirdCount/2;
          });
        }
        if (partyCounts.key == 'repBelowMargin') {
          partyCounts = partyCounts.map(stackData => {
            stackData[0] = stackData.data.thirdCount/2;
            stackData[1] = stackData.data.thirdCount/2 + stackData.data.repBelowMargin;
          });
        }
        if (partyCounts.key == 'repAboveMargin') {
          partyCounts = partyCounts.map((stackData, i) => {
            if (false && i > 0 && partyCounts[i-1].data.repAboveMargin == 0) {
              stackData[0] = -1 * (stackData.data.demBelowMargin + stackData.data.thirdCount/2);
              stackData[1] = stackData.data.thirdCount/2 + stackData.data.repBelowMargin;
            } else {
              stackData[0] = 0; //stackData.data.thirdCount/2 + stackData.data.repBelowMargin;
              stackData[1] = stackData.data.thirdCount/2 + stackData.data.repBelowMargin + stackData.data.repAboveMargin;
            }
          });
        }
      });
    }
    const stack = d3.stack()
      .keys(['demAboveMargin', 'demBelowMargin', 'thirdCount', 'repBelowMargin', 'repAboveMargin'])
      .offset(offset);
    var stackedData = stack(this.data.rawPartyCounts);
    // split the margins into separate series
    let demMajorityYears = stackedData[0].filter(yd => yd.data.demAboveMargin > 0).map(yd => yd.data.year),
      demStartYears = demMajorityYears.filter((year, i) => i == 0 || !demMajorityYears.includes(year - 2)),
      demEndYears = demMajorityYears.filter((year, i) => i == demMajorityYears.length -1 || !demMajorityYears.includes(year + 2)),
      demSpans = demStartYears.map((sy, i) => [sy, demEndYears[i]]),
      demSeries = [];
    demSpans.forEach(span => {
      const startIndex = stackedData[0].findIndex(yd => yd.data.year == span[0]),
        endIndex = stackedData[0].findIndex(yd => yd.data.year == span[1]),
        aDemSeries = stackedData[0].slice(startIndex, (startIndex == endIndex) ? endIndex + 2 : endIndex + 1);
      demSeries.push(aDemSeries);
    });

    let repMajorityYears = stackedData[4].filter(yd => yd.data.repAboveMargin > 0).map(yd => yd.data.year),
      repStartYears = repMajorityYears.filter((year, i) => i == 0 || !repMajorityYears.includes(year - 2)),
      repEndYears = repMajorityYears.filter((year, i) => i == repMajorityYears.length -1 || !repMajorityYears.includes(year + 2)),
      repSpans = repStartYears.map((sy, i) => [sy, repEndYears[i]]),
      repSeries = [];
    repSpans.forEach(span => {
      const startIndex = stackedData[4].findIndex(yd => yd.data.year == span[0]),
        endIndex = stackedData[4].findIndex(yd => yd.data.year == span[1]),
        aRepSeries = stackedData[4].slice(startIndex, (startIndex == endIndex) ? endIndex + 2 : endIndex + 1);
      repSeries.push(aRepSeries);
    });

    delete(stackedData[4]);
    delete(stackedData[0]);
    stackedData = repSeries.concat(stackedData);
    stackedData = demSeries.concat(stackedData);

    this.data.partyCounts = stackedData;
  },

  getSlivers() {
    return this.data.slivers;
  },

  getPreviousAndNext3(year, spatialId) {
    let theSeven = {};
    console.log(year);
    for (let y = parseInt(year) - 6; y <= parseInt(year) + 6; y = y+2) {
      let districtId = this.getDistrictId(y, spatialId);
      theSeven[y] = this.getElectionDataForDistrict(y, districtId);
    }

    return theSeven;
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
      DistrictsStore.parseRawPartyCounts();
      DistrictsStore.parsePartyCounts();
      DistrictsStore.parseStates();
      break;
    case AppActionTypes.congressSelected:
      DistrictsStore.loadDistrictsForCongress(action.year);
      break;
  }
  return true;
});

export default DistrictsStore;