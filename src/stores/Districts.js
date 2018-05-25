import { EventEmitter } from 'events';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';

import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import { congressForYear, getStateAbbr, getStateName } from '../utils/HelperFunctions';

import bubbleXYs from '../../data/bubbleXYs.json';
import Elections from '../../data/elections.json';
import SpatialIds from '../../data/spatialids.json';
import StatesTopoJson from '../../data/states.json';
import Slivers from '../../data/sliversTJ.json';
import MetroNames from '../../data/metroNames.json';

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
    partyCountsKeys: [],
    congressYears: [],
    slivers: []
  },

  loadDistrictsForCongress: function(year) {
    const congress = congressForYear(year);
    this.data.congressDistricts[year] = this.data.congressDistricts[year] || [];

    fetch('static/districts-geojson/' + congress + '.json')
      .then(
        (response) => {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }

          // Examine the text in the response
          response.json().then((data) => {
            // data.objects = {
            //   type: 'GeometryCollection',
            //   geometries: Object.keys(data.objects).map(k => data.objects[k])
            // };
            const theGeoJson = data; //topojson.feature(data, data.objects);
            theGeoJson.features.forEach(d => {
              if (!this.data.districts[d.properties.id]) {
                this.data.districts[d.properties.id] = {
                  id: d.properties.id,
                  statename: d.properties.statename,
                  district: d.properties.district,
                  startcong: d.properties.startcong,
                  endcong: d.properties.endcong,
                  the_geojson: d.geometry
                };
              }

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
    // Slivers.objects = {
    //   type: 'GeometryCollection',
    //   geometries: Object.keys(Slivers.objects).map(k => Slivers.objects[k])
    // };
    // const theGeoJson = topojson.feature(Slivers, Slivers.objects);
    // this.data.slivers = theGeoJson;

    this.data.states = topojson.feature(StatesTopoJson, StatesTopoJson.objects.states).features; 
    this.emit(AppActionTypes.storeChanged);
  },

  parseBubbles: function() {
    // let yearsWeHave = bubbleXYs.map(yearData => yearData.year);
    // for (let y = 1836; y <= )
    // let yearsWeHave = Object.keys(Elections).map(y => parseInt(y)),
    //   firstYear = yearsWeHave[0],
    //   lastYear = yearsWeHave[yearsWeHave.length-1],
    //   missing = [];
    // for (let y = firstYear; y < lastYear; y = y+2) {
    //   if (!yearsWeHave.includes(y)) {
    //     missing.push(y);
    //   }
    // }
    // console.log('From ' + firstYear + ' to ' + lastYear);
    // console.log('missing: ');
    // console.log(missing);


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
                return {
                  id: SpatialIds[yearData.year][d.id] || 'missing' + yearData.year + i,
                  x: (0.09 + Math.random() * 0.02) * DimensionsStore.getMapScale(),
                  y: (0.19 + Math.random() * 0.02) * DimensionsStore.getMapScale(),
                  xOrigin: -1000,
                  yOrigin: -1000,
                  state: state,
                  district: district,
                  districtId: d.id,
                  regularized_party_of_victory: regularized_party_of_victory,
                  percent_vote: -1,
                  flipped: false,
                };
              }
              const regularized_party_of_victory = Elections[yearData.year][state][district].regularized_party_of_victory,
                previousDistrictId = this.getDistrictId(yearData.year - 2, SpatialIds[yearData.year][d.id]),
                previousDistrictNum = this.getDistrictNum(yearData.year - 2, previousDistrictId),
                flipped = !!(regularized_party_of_victory && previousDistrictId && Elections[yearData.year - 2] && Elections[yearData.year - 2][state] && Elections[yearData.year - 2][state][previousDistrictNum] && Elections[yearData.year - 2][state][previousDistrictNum].regularized_party_of_victory !== regularized_party_of_victory);
              return {
                id: SpatialIds[yearData.year][d.id] || 'missing' + yearData.year + i,
                x: d.x * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().width/2,
                y: d.y * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().height/2,
                xOrigin: d.xOrigin * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().width/2,
                yOrigin: d.yOrigin * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().height/2,
                state: state,
                district: district,
                districtId: d.id,
                regularized_party_of_victory: regularized_party_of_victory,
                party_of_victory: Elections[yearData.year][state][district].party_of_victory,
                victor: Elections[yearData.year][state][district].victor,
                percent_vote: Elections[yearData.year][state][district].percent_vote,
                flipped: flipped,
              };
            })
            .sort((a,b) => (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0),
          cities: yearData.cities.map(d => {
            return {
              id: MetroNames[d.id],
              x: d.x * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().width/2,
              y: d.y * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().height/2,
              xOrigin: d.xOrigin * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().width/2,
              yOrigin: d.yOrigin * DimensionsStore.getMapScale() + DimensionsStore.getMapDimensions().height/2,
              r: d.r * DimensionsStore.getMapScale()
            };
          }),
        };
      });

    // let cities = [];
    // this.data.bubbleCoords.forEach(yearData => {
    //   yearData.cities.forEach(city => cities.push(city.id));
    // });
    // cities = Array.from(new Set(cities));
    // console.log(cities);
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
    return d3.geoAlbersUsa()
      .scale(DimensionsStore.getMapScale())
      .translate([DimensionsStore.getDimensions().mapWidth/2, DimensionsStore.getDimensions().mapHeight/2]);
  },

  projectPoint(point) { return this.getProjection()(point); },

  getBubbleCoords: function(year) { return this.data.bubbleCoords.find(bc => bc.year == year) || { districts: [], cities: [] }; },

  getElectionDistrictIds: function(year) { return this.data.bubbleCoords.find(bc => bc.year == year).districts.map(d => d.id); },

  getElectionDistricts: function(year) { 
    const districts = [],
      opacity = d3.scaleLinear().domain([0,10000,600000]).range([1,0.2,0.2]);

  
              

    Object.keys(this.data.districts).forEach(id => {
      if (this.data.congressDistricts[year] && this.data.congressDistricts[year].includes(id) && this.data.districts[id] && Elections[year][getStateAbbr(this.data.districts[id].statename)] && Elections[year][getStateAbbr(this.data.districts[id].statename)][this.data.districts[id].district]) {
        const state = getStateAbbr(this.data.districts[id].statename),
          regularized_party_of_victory = Elections[year][state][this.data.districts[id].district].regularized_party_of_victory,
          previousDistrictId = this.getDistrictId(year - 2, SpatialIds[year][id]),
          previousDistrictNum = this.getDistrictNum(year - 2, previousDistrictId),
          flipped = !!(regularized_party_of_victory && previousDistrictId && Elections[year - 2] && Elections[year - 2][state] && Elections[year - 2][state][previousDistrictNum] && Elections[year - 2][state][previousDistrictNum].regularized_party_of_victory !== regularized_party_of_victory);

        let d = this.data.districts[id];
        d.regularized_party_of_victory = regularized_party_of_victory,
        d.percent_vote = Elections[year][getStateAbbr(d.statename)][d.district].percent_vote;
        d.opacity = opacity(d.area);
        d.flipped = flipped;
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
    let districtId = null;
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

  getRawPartyCounts (year) { return (year) ? this.data.rawPartyCounts.find(pc => pc.year === year) : this.data.rawPartyCounts; },

  getPartyCountsKeys() { return this.data.partyCountsKeys; },

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
          whigCount = this.getPartyCountForYearAndParty(year, 'whig'),
          demCount = this.getPartyCountForYearAndParty(year, 'democrat'),
          demAboveMargin = (year < 1856) ? demCount - whigCount : demCount - repCount;
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
          demAboveMargin: (demAboveMargin > 0) ? demAboveMargin : 0,
          demBelowMargin: (demAboveMargin <= 0) ? demCount : demCount - demAboveMargin,
          thirdCount: this.getPartyCountForYearAndParty(year, 'third'),
          whigBelowMargin: (demAboveMargin >= 0) ? whigCount : demCount,
          repBelowMargin: (demAboveMargin >= 0) ? repCount : demCount,
          whigAboveMargin: (demAboveMargin >= 0) ? 0 : whigCount - demCount,
          repAboveMargin: (demAboveMargin >= 0) ? 0 : repCount - demCount
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
        if (partyCounts.key == 'whigBelowMargin') {
          partyCounts = partyCounts.map(stackData => {
            stackData[0] = stackData.data.thirdCount/2;
            stackData[1] = stackData.data.thirdCount/2 + stackData.data.whigBelowMargin;
          });
        }
        if (partyCounts.key == 'whigAboveMargin') {
          partyCounts = partyCounts.map((stackData, i) => {
            if (false && i > 0 && partyCounts[i-1].data.whigAboveMargin == 0) {
              stackData[0] = -1 * (stackData.data.demBelowMargin + stackData.data.thirdCount/2);
              stackData[1] = stackData.data.thirdCount/2 + stackData.data.whigBelowMargin;
            } else {
              stackData[0] = 0; //stackData.data.thirdCount/2 + stackData.data.whigBelowMargin;
              stackData[1] = stackData.data.thirdCount/2 + stackData.data.whigBelowMargin + stackData.data.whigAboveMargin;
            }
          });
        }
      });
    }
    const stack = d3.stack()
      .keys(['demAboveMargin', 'demBelowMargin', 'thirdCount','whigBelowMargin','repBelowMargin','whigAboveMargin','repAboveMargin'])
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

    let repMajorityYears = stackedData[6].filter(yd => yd.data.repAboveMargin > 0).map(yd => yd.data.year),
      repStartYears = repMajorityYears.filter((year, i) => i == 0 || !repMajorityYears.includes(year - 2)),
      repEndYears = repMajorityYears.filter((year, i) => i == repMajorityYears.length -1 || !repMajorityYears.includes(year + 2)),
      repSpans = repStartYears.map((sy, i) => [sy, repEndYears[i]]),
      repSeries = [];
    repSpans.forEach(span => {
      const startIndex = stackedData[6].findIndex(yd => yd.data.year == span[0]),
        endIndex = stackedData[6].findIndex(yd => yd.data.year == span[1]),
        aRepSeries = stackedData[6].slice(startIndex, (startIndex == endIndex) ? endIndex + 2 : endIndex + 1);
      repSeries.push(aRepSeries);
    });

    let whigMajorityYears = stackedData[5].filter(yd => yd.data.whigAboveMargin > 0).map(yd => yd.data.year),
      whigStartYears = whigMajorityYears.filter((year, i) => i == 0 || !whigMajorityYears.includes(year - 2)),
      whigEndYears = whigMajorityYears.filter((year, i) => i == whigMajorityYears.length -1 || !whigMajorityYears.includes(year + 2)),
      whigSpans = whigStartYears.map((sy, i) => [sy, whigEndYears[i]]),
      whigSeries = [];
    whigSpans.forEach(span => {
      const startIndex = stackedData[5].findIndex(yd => yd.data.year == span[0]),
        endIndex = stackedData[5].findIndex(yd => yd.data.year == span[1]),
        aWhigSeries = stackedData[5].slice(startIndex, (startIndex == endIndex) ? endIndex + 2 : endIndex + 1);
      whigSeries.push(aWhigSeries);
    });

    stackedData.splice(5,2);
    stackedData.splice(0,1);
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

  getSlivers() { return this.data.slivers; },

  getPreviousAndNext3(year, spatialId) {
    let theSeven = {};
    for (let y = parseInt(year) - 6; y <= parseInt(year) + 6; y = y+2) {
      let districtId = this.getDistrictId(y, spatialId);
      theSeven[y] = this.getElectionDataForDistrict(y, districtId);
    }

    return theSeven;
  },

  getSpatialIdData(spatialId) {
    let areaData = {};
    for (let y = 1824; y <= 2004; y = y+2) {
      let districtId = this.getDistrictId(y, spatialId),
        districtData = this.getElectionDataForDistrict(y, districtId);
      if (districtData) {
        areaData[y] = districtData;
      }
    }

    return areaData;
  },

  getDistrictLabel (year, id) {
    return `${getStateName(this.getElectionDataForDistrict(year, id).state)} ${ this.getElectionDataForDistrict(year, id).district}`;
  }

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

    case AppActionTypes.windowResized:
      DistrictsStore.parseBubbles();
      break;
  }
  return true;
});

export default DistrictsStore;