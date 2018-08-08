import { EventEmitter } from 'events';
import dissolve from 'geojson-dissolve';
import * as d3 from 'd3';

import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import { congressForYear, getStateAbbr, getStateName, getStateAbbrLong } from '../utils/HelperFunctions';

import bubbleXYs from '../../data/bubbleXYs.json';
import Elections from '../../data/elections.json';
import SpatialIds from '../../data/spatialids.json';
import MetroNames from '../../data/metroNames.json';

import DimensionsStore from './DimensionsStore';

const DistrictsStore = {

  data: {
    bubbleCoords: [],
    districts: [],
    states: [],
    elections: Elections,
    congressDistricts: {},
    theMap: null,
    rawPartyCounts: [],
    partyCounts: [],
    partyCountsKeys: [],
    congressYears: [],
    slivers: [],
    earliestYear: null,
    lastYear: null
  },

  loadDistrictsForCongress: function (year) {
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
          response.json().then((data) => {
            const theGeoJson = data; 
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

  parseBubbles: function () {
    this.data.bubbleCoords = bubbleXYs
      .map((yearData) => {
        return {
          year: yearData.year,
          districts: yearData.districts
            .filter(d => d.id)
            .map((d, i) => {
              const state = d.district.substring(0, 2);
              const district = parseInt(d.district.substring(2), 10);

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
                x: d.x * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionWidth/2,
                y: d.y * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionHeight/2,
                xOrigin: d.xOrigin * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionWidth/2,
                yOrigin: d.yOrigin * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionHeight/2,
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
              x: d.x * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionWidth/2,
              y: d.y * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionHeight/2,
              xOrigin: d.xOrigin * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionWidth/2,
              yOrigin: d.yOrigin * DimensionsStore.getMapScale() + DimensionsStore.getDimensions().mapProjectionHeight/2,
              r: d.r * DimensionsStore.getMapScale()
            };
          }),
        };
      });

    this.emit(AppActionTypes.storeChanged);
  },

  hasYearLoaded: function(year) { return this.data.congressDistricts[year] && this.data.congressDistricts[year].length > 0; },

  getPartyCounts: function () { return this.data.partyCounts; },

  getCongressYears: function () { return this.data.congressYears; },

  getPathFunction: function () { return d3.geoPath(this.getProjection()); },

  getPath: function (g) { return this.getPathFunction()(g); },

  getTheMap: function () { return this.data.theMap; },

  getVisibleBounds: function() { return this.data.theMap.getBounds(); },

  getProjection: function() {
    return d3.geoAlbersUsa()
      .scale(DimensionsStore.getMapScale())
      .translate([DimensionsStore.getDimensions().mapProjectionWidth/2, DimensionsStore.getDimensions().mapProjectionHeight/2]);
  },

  getEarliestYear: function () {
    if (!this.data.earliestYear) {
      this.data.earliestYear = Math.min(...Object.keys(this.data.elections)
        .map(y => parseInt(y, 10)));
    }
    return this.data.earliestYear;
  },

  getLastYear: function () {
    if (!this.data.lastYear) {
      this.data.lastYear = Math.max(...Object.keys(this.data.elections)
        .map(y => parseInt(y, 10)));
    }
    return this.data.lastYear;
  },

  getElectionYears: function () {
    return Object.keys(this.data.elections)
      .map(y => parseInt(y, 10))
      .sort();
  },

  projectPoint(point) { return this.getProjection()(point); },

  getBubbleForDistrict: function (id, year) {
    const yearBubbles = this.data.bubbleCoords.find(bc => bc.year === year);
    if (yearBubbles.districts) {
      return yearBubbles.districts.find(d => d.districtId === id);
    }
  },

  getBubbleCoords: function(year) { return this.data.bubbleCoords.find(bc => bc.year === year) || { districts: [], cities: [] }; },

  cityHasParty: function (cityId, year, party) {
    let hasParty = false;
    const cityBubble = this.getBubbleCoords(year).cities.find(c => c.id === cityId);
    this.getBubbleCoords(year).districts.forEach((d) => {
      if (this.districtInCity(d, cityBubble) && d.regularized_party_of_victory === party) {
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
        if (d.regularized_party_of_victory === party) {
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
    this.getBubbleCoords(year).districts.forEach((d) => {
      if (this.districtInCity(d, cityBubble)) {
        districtCount += 1;
        if (d.flipped) {
          flippedCount += 1;
        }
      }  
    });
    return flippedCount / districtCount;
  },

  getStatePreviousDistrictId: function (year, id) {
    let previousId = false;
    const districtData = this.getElectionDataForDistrict(year, id);
    const { state, district } = districtData;
    if (district !== 0) {
      const nextAbbr = `${state}${district - 1}`;
      previousId = this.getDistrictIdFromStateDistrict(year, nextAbbr);
    }
    return previousId;
  },

  getStateNextDistrictId: function (year, id) {
    const districtData = this.getElectionDataForDistrict(year, id);
    const { state, district } = districtData;
    const nextAbbr = `${state}${district + 1}`;
    return this.getDistrictIdFromStateDistrict(year, nextAbbr);
  },

  getDistrictIdFromStateDistrict: function (year, abbr) {
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

  getElectionDistrictIds: function(year) { return this.data.bubbleCoords.find(bc => bc.year === year).districts.map(d => d.id); },

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

  // getElectionDistrict: function (year, id) {
  //   return this.getElectionDistricts(year).find(d => d.id )
  // },

  getElectionDataForDistrict: function (year, id) {
    const yearData = this.data.bubbleCoords.find(d => parseInt(d.year, 10) === parseInt(year, 10));
    return (yearData) ? yearData.districts.find(d => d.districtId === id) : false;
  },

  getXYZForDistrict: function (id) {
    const centroid = this.getPathFunction().centroid(this.data.districts[id].the_geojson);
    const x = centroid[0] / DimensionsStore.getDimensions().mapProjectionWidth;
    const y = centroid[1] / DimensionsStore.getDimensions().mapProjectionHeight;
    const bounds = this.getPathFunction().bounds(this.data.districts[id].the_geojson);
    // calculate the highest zoom level that doesn't expand beyond the bounding box
    const maxHorizontal = Math.max(centroid[0] - bounds[0][0], bounds[1][0] - centroid[0]);
    let zHorizontal = 1;
    while (maxHorizontal * zHorizontal < DimensionsStore.getDimensions().mapWidth / 2) {
      zHorizontal *= 1.62;
    }
    const maxVertical = Math.max(centroid[1] - bounds[0][1], bounds[1][1] - centroid[1]);
    let zVertical = 1;
    while (maxVertical * zVertical < DimensionsStore.getDimensions().mapHeight / 2) {
      zVertical *= 1.62;
    }
    const z = Math.round(Math.min(zHorizontal, zVertical) / 1.62 * 100) / 100;
    return {
      x: x,
      y: y,
      z: z
    };

    // const theBounds = DistrictsStore.getPathFunction().bounds(d.the_geojson);
    // const theBoundsPerc = theBounds.map(point => [point[0] / DimensionsStore.getDimensions().mapProjectionWidth, point[1] / DimensionsStore.getDimensions().mapProjectionHeight]);
    // console.log(theBoundsPerc);
  },

  getXYXForDistrictAndBubble: function (id, year) {
    const bounds = this.getPathFunction().bounds(this.data.districts[id].the_geojson);
    const theBubble = this.getBubbleForDistrict(id, year);
    const radius = 5;
    const minX = Math.min(bounds[0][0], theBubble.x - radius);
    const maxX = Math.max(bounds[1][0], theBubble.x + radius);
    const minY = Math.min(bounds[0][1], theBubble.y - radius);
    const maxY = Math.max(bounds[1][1], theBubble.y + radius);

    let zHorizontal = 1;
    while ((maxX - minX) * zHorizontal < DimensionsStore.getDimensions().mapWidth / 2) {
      zHorizontal *= 1.62;
    }
    let zVertical = 1;
    while ((maxY - minY) * zVertical < DimensionsStore.getDimensions().mapHeight / 2) {
      zVertical *= 1.62;
    }

    const x = (minX + maxX) / 2 / DimensionsStore.getDimensions().mapProjectionWidth;
    const y = (minY + maxY) / 2 / DimensionsStore.getDimensions().mapProjectionHeight;
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

  getDistrictCentroid: function (id) {
    return (this.data.districts[id]) ? this.getPathFunction().centroid(this.data.districts[id].the_geojson) : 0;
  },

  getDistrictNum: function (year, spatialId) {
    if (!year || !spatialId) { return false; }
    let districtNum;
    const yearData = bubbleXYs.find(yd => yd.year === year);
    if (yearData && yearData.districts) {
      yearData.districts.every((d) => {
        if (d.id === spatialId) {
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
          const party = (Elections[year][state][district].regularized_party_of_victory === 'Republican' || Elections[year][state][district].regularized_party_of_victory === 'Democrat') ? Elections[year][state][district].regularized_party_of_victory : 'Third';
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

  getRawPartyCounts: function (year) { return (year) ? this.data.rawPartyCounts.find(pc => pc.year === year) : this.data.rawPartyCounts; },

  getPartyCountsKeys() { return this.data.partyCountsKeys; },

  getStates(year) { 
    const districts = this.getElectionDistricts(year);

    const stateNames = districts.map(d => d.statename)
      .filter((sn, i, self) => self.indexOf(sn) === i)
      .sort();

    const statesGeojson = stateNames.map(sn => {
      const districtsGeojson = districts.filter(d => d.statename === sn)
        .map(d => d.the_geojson);
      //const stateGeojson = geojsonMerge.merge(districtsGeojson);
      const stateGeojson = dissolve(districtsGeojson);
      stateGeojson.properties = { statename: sn };
      return stateGeojson;
    });

    return statesGeojson;
  },

  getPartyCountForYearAndParty: function (year, party) {
    return Object.keys(Elections[year]).reduce((accumulator, state) => {
        return accumulator + Object.keys(Elections[year][state]).reduce((accumulator2, districtNum) => {
          return accumulator2 + ((Elections[year][state][districtNum].regularized_party_of_victory === party) ? 1 : 0) 
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
    console.log(this.data.rawPartyCounts);
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

    console.log(stackedData[4]);


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
    for (let y = 1836; y <= 2010; y = y + 2) {
      let districtId = this.getDistrictId(y, spatialId),
        districtData = this.getElectionDataForDistrict(y, districtId);
      if (districtData) {
        areaData[y] = districtData;
      }
    }

    return areaData;
  },

  getDistrictLabel: function (year, id) {
    const state = getStateAbbrLong(this.getElectionDataForDistrict(year, id).state);
    return (this.getElectionDataForDistrict(year, id).district === 0) ? `${state} At Large` : `${state} ${this.getElectionDataForDistrict(year, id).district}`;
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
  switch (action.type) {
    case AppActionTypes.loadInitialData:
      const year = action.hashState.year || action.state.selectedYear || null;

      DistrictsStore.parseBubbles();
      DistrictsStore.loadDistrictsForCongress(year);
      DistrictsStore.parseRawPartyCounts();
      DistrictsStore.parsePartyCounts();
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