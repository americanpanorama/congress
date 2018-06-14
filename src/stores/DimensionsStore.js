import { EventEmitter } from 'events';
import * as d3 from 'd3';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

const DimensionsStore = {

  data: {
    gutterPadding: 20,
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
    headerHeight: 100,
    sidebarHeight: 100, // placeholder
    infoWidth: 100,
    infoHeight: 300,
    timelineWidth: 350,
  },

  computeComponentDimensions () {
    this.data.windowHeight = window.innerHeight;
    this.data.windowWidth = window.innerWidth;

    this.data.gutterPadding = this.data.windowHeight * 0.01;

    this.data.headerHeight = this.data.windowHeight * 1/12 - this.data.gutterPadding * 1.5;
    this.data.headerGutter = this.data.headerHeight * 0.01;
    this.data.headerTitleFontSize = this.data.headerHeight / 2 - this.data.headerGutter * 1.5;
    this.data.headerSubtitleFontSize = this.data.headerHeight / 3 - this.data.headerGutter * 1.5;

    this.data.timelineHeight = this.data.windowHeight / 4 - this.data.gutterPadding * 1.5;

    this.data.infoWidth = this.data.windowWidth - this.data.sidebarWidth;

    this.data.mapHeight = this.data.windowHeight * 7.5 / 12;
    this.data.mapWidth = this.data.windowWidth;

    this.data.vizControlTrackHeight = this.data.headerSubtitleFontSize * 0.8;

    this.data.sidebarBottom = this.data.gutterPadding;
    this.data.sidebarLeft = this.data.gutterPadding;
    this.data.sidebarHeight = this.data.timelineHeight + this.data.windowHeight / 24;
    this.data.sidebarWidth = this.data.timelineHeight;

    this.data.electionLabelBottom = this.data.timelineHeight + this.data.gutterPadding;
    this.data.electionLabelLeft = this.data.timelineHeight + this.data.gutterPadding;
    this.data.electionLabelHeight = this.data.windowHeight / 24;
    this.data.electionLabelWidth = this.data.windowWidth - this.data.sidebarWidth * 2;
    this.data.electionLabelFontSize = this.data.electionLabelHeight * 2/3;

    this.data.districtLabelBottom = this.data.electionLabelBottom;
    this.data.districtLabelLeft = this.data.gutterPadding;
    this.data.districtLabelHeight = this.data.electionLabelHeight;
    this.data.districtLabelWidth = this.data.sidebarWidth;

    this.data.zoomControlsHeight = this.data.electionLabelHeight;
    this.data.zoomControlsWidth = this.data.sidebarWidth;
    this.data.zoomControlsRight = this.data.gutterPadding;
    this.data.zoomControlsBottom = this.data.electionLabelBottom;

    this.data.nextPreviousButtonHeight = this.data.electionLabelHeight * 6/12;
    this.data.nextPreviousButtonYOffset = this.data.electionLabelHeight * 3/12;

    this.data.mapLegendWidth = this.data.timelineHeight;
    this.data.mapLegendHeight = this.data.timelineHeight;
    this.data.mapLegendTopGutter = this.data.mapLegendHeight * 2/12;
    this.data.mapLegendRadius = this.data.mapLegendHeight / 24;
    this.data.mapLegendLabelGutter = this.data.mapLegendRadius / 2;
    this.data.mapLegendElementHeight = this.data.mapLegendHeight / 12;
    this.data.mapLegendFontSize = this.data.mapLegendHeight / 12;
    this.data.mapLegendSymbolHeight = this.data.mapLegendFontSize;

    this.data.timelineYAxisWidth = 80;

    this.data.timelineWidth = this.data.windowWidth - this.data.sidebarWidth * 2 - this.data.timelineYAxisWidth - this.data.gutterPadding * 2;
    this.data.timelineHorizontalGutter = this.data.timelineHeight * 1/12;
    this.data.timelineSteamgraphHeight = this.data.timelineHeight * 9/12;
    this.data.timelineSteamgraphGutter = this.data.timelineSteamgraphHeight * 0.02;
    this.data.timelineAxisHeight = this.data.timelineHeight * 2/12;
    this.data.timelineAxisGutter = this.data.timelineAxisHeight * 1/12;
    this.data.timelineAxisLongTickHeight = this.data.timelineAxisHeight * 3/12;
    this.data.timelineAxisShortTickHeight = this.data.timelineAxisHeight * 2/12;
    this.data.timelineAxisFontSize = this.data.timelineAxisHeight * 6/12;
    this.data.timelineAxisFontSizeSelected = this.data.timelineAxisHeight * 9/12;
    this.data.timelineElectionFontSize = this.data.timelineHorizontalGutter * 7/12;
    this.data.timelineCongressFontSize = this.data.timelineHorizontalGutter * 5/12;
    this.data.timelineAxisOffsetForDistrict = this.data.timelineAxisLongTickHeight + this.data.timelineSteamgraphGutter * 2;

    this.data.districtR = Math.min(this.data.mapWidth/960* 1000, this.data.mapHeight/500 * 1000) / 960 * 5;

    this.data.cityLabelFontSize = this.data.districtR * 1.5;

    this.data.vizControlsRight =  this.data.gutterPadding*2 + this.data.mapWidth/2;
    this.data.winnerControlLeft = this.data.gutterPadding*2 + this.data.mapWidth/2;

    this.data.textTop = this.data.headerHeight;
    this.data.textBottom = this.data.gutterPadding;
    this.data.textLeft = this.data.electionLabelLeft;
    this.data.textWidth = this.data.electionLabelWidth;
    this.data.textCloseTop = this.data.textTop + 10;
    this.data.textCloseRight = this.data.electionLabelLeft + 10;


    this.emit(AppActionTypes.storeChanged);
  },

  getMapDimensions: function() {
    return {
      width: this.data.mapWidth,
      height: this.data.mapHeight
    };
  },

  getMapScale: function() { return Math.min(this.data.mapWidth/960* 1075, this.data.mapHeight/500 * 1075); },

  getDimensions: function() { return this.data; },

  getSVGArc(padding, radius, sweepFlag) {
    sweepFlag = (sweepFlag) ? sweepFlag : 1; 
    const xEnd = (radius - (radius-this.data.cityLabelFontSize) * Math.cos(0.2)),
      yEnd = Math.abs(radius + (radius-this.data.cityLabelFontSize) * Math.sin(0.2));
    return 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ' ' + (radius-padding) + ', 0 1, ' + sweepFlag + ' ' + xEnd + ',' + yEnd; 
  },

  getTitleLabelArc(radius) { return this.getSVGArc(this.data.cityLabelFontSize, radius); },

  timelineX (year) {
    const x = d3.scaleLinear()
      .domain([1824, 2016])
      .range([15, this.data.timelineWidth]);
    return x(year);
  },

  timelineXTermSpan () { return this.timelineX(1900) - this.timelineX(1898); },

  timelineNationalY (count, domain) {
    const theDomain = domain || [-350, 300];
    const y = d3.scaleLinear()
      .domain(theDomain)
      .range([0, this.data.timelineSteamgraphHeight - this.data.timelineSteamgraphGutter * 2]);
    return y(count);
  },

  timelineDistrictY: function (percent, maxRepublicans) {
    const y = d3.scaleLinear()
      .domain([-1, -0.5, 0, 0.5, 1])
      .range([
        this.timelineNationalY(maxRepublicans * -1), 
        this.timelineNationalY(0), 
        this.timelineNationalY(0),
        this.timelineNationalY(0), 
        this.timelineNationalY(maxRepublicans)
      ]);
    return y(percent);
  },

  timelineDistrictYWithParty: function (percent, party, maxRepublicans) {
    let y = this.timelineDistrictY(1, maxRepublicans) + this.data.timelineAxisOffsetForDistrict;
    if (percent > 0) {
      if (party === 'democrat') {
        y = this.timelineDistrictY(percent * -1, maxRepublicans);
      } else if (party === 'republican' || party === 'whig') {
        y = this.timelineDistrictY(percent, maxRepublicans);
      }
    }
    return y;
  }
};

// Mixin EventEmitter functionality
Object.assign(DimensionsStore, EventEmitter.prototype);

// Register callback to handle all updates
AppDispatcher.register((action) => {

  switch (action.type) {

    case AppActionTypes.loadInitialData:
    case AppActionTypes.windowResized:
      DimensionsStore.computeComponentDimensions();
    break;
  }
  return true;
});

export default DimensionsStore;