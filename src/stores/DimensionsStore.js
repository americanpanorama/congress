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
    timelineWidth: 350
  },

  computeComponentDimensions: function () {
    this.data.windowHeight = window.innerHeight;
    this.data.windowWidth = window.innerWidth;

    this.data.aspectRatio = this.data.windowHeight / this.data.windowWidth;

    this.data.gutterPadding = this.data.windowHeight * 0.01;

    this.data.headerHeight = this.data.windowHeight * 1 / 24;
    this.data.headerGutter = this.data.headerHeight * 0.01;
    this.data.headerTitleFontSize = this.data.headerHeight;
    this.data.headerSubtitleFontSize = this.data.headerHeight  * 2 / 3;

    this.data.navHeight = this.data.windowHeight * 1 / 24;
    this.data.navFontSize = this.data.navHeight / 2;
    this.data.navStyle = {
      height: this.data.navHeight,
      fontSize: this.data.navFontSize
    };

    this.data.mapHeight = this.data.windowHeight * 15 / 24;
    this.data.mapWidth = this.data.windowWidth;

    const horizontalScale = this.data.mapWidth / 960 * 1075;
    const verticalScale = this.data.mapHeight * 0.9 / 500 * 1075;
    this.data.mapScale = Math.min(horizontalScale, verticalScale);

    this.data.timelineHeight = this.data.windowHeight * 6 / 24 - this.data.gutterPadding;

    this.data.searchTop = this.data.headerHeight / 2;
    this.data.searchRight = this.data.gutterPadding;
    this.data.searchWidth = this.data.timelineHeight;

    this.data.infoWidth = this.data.windowWidth - this.data.sidebarWidth;

    this.data.searchStyle = {
      top: this.data.searchTop,
      right: this.data.searchRight,
      width: this.data.searchWidth
    };

    this.data.searchResultsHeight = this.data.mapHeight - 20;

    // calculate the amount of padding either top/bottom or left/right for the map when displayed at zoom 0
    // the ratio of width to height for albers is 960 / 500 or 1.92
    const projWxHRatio = 960 / 500;
    const vpWxHRatio = this.data.mapWidth / this.data.mapHeight;

    // if viewport wider than map so left/right padding
    if (vpWxHRatio > projWxHRatio) {
      this.data.mapProjectionWidth = projWxHRatio * this.data.mapHeight;
      this.data.mapProjectionHeight = this.data.mapHeight;
      this.data.mapLRPadding = (this.data.mapWidth - this.data.mapProjectionWidth) / 2;
      this.data.mapTBPadding = 0;
    } else if (vpWxHRatio > projWxHRatio) {
      this.data.mapProjectionWidth = this.data.mapWidth;
      this.data.mapProjectionHeight = this.data.mapWidth / projWxHRatio;
      this.data.mapLRPadding = 0;
      this.data.mapTBPadding = (this.data.mapHeight / this.data.mapProjectionHeight) / 2;
    } else {
      this.data.mapProjectionWidth = this.data.mapWidth;
      this.data.mapProjectionHeight = this.data.mapHeight;
      this.data.mapLRPadding = 0; 
      this.data.mapTBPadding = 0;
    }

    this.data.mapWidthPaddingPerc = (vpWxHRatio > projWxHRatio) ? this.data.mapWidth / this.data.mapHeight : 0;
    // 1920*(((1920+400) / 1000) / (960/500)-1)/2

    this.data.vizControlTrackHeight = this.data.headerSubtitleFontSize * 0.8;

    this.data.sidebarBottom = this.data.gutterPadding;
    this.data.sidebarLeft = this.data.gutterPadding;
    this.data.sidebarHeight = this.data.windowHeight * 7 / 24 - this.data.sidebarBottom; //this.data.timelineHeight + this.data.windowHeight / 24;

    this.data.sidebarWidth = (this.data.aspectRatio < 0.75)
      ? this.data.timelineHeight + this.data.gutterPadding
      : this.data.windowHeight / 24 * 5; // this.data.windowWidth * 2 / 12;

    this.data.electionLabelBottom = this.data.timelineHeight + this.data.gutterPadding;
    this.data.electionLabelLeft = this.data.sidebarWidth + this.data.gutterPadding;
    this.data.electionLabelHeight = this.data.windowHeight / 24;
    this.data.electionLabelWidth = this.data.windowWidth - this.data.sidebarWidth * 2 - this.data.gutterPadding;
    this.data.electionLabelFontSize = this.data.electionLabelHeight * 2/3;

    this.data.districtLabelBottom = this.data.electionLabelBottom;
    this.data.districtLabelLeft = this.data.gutterPadding;
    this.data.districtLabelHeight = this.data.electionLabelHeight;
    this.data.districtLabelWidth = this.data.sidebarWidth;

    this.data.zoomControlsHeight = this.data.electionLabelHeight;
    this.data.zoomControlsWidth = this.data.sidebarWidth;
    this.data.zoomControlsRight = this.data.gutterPadding;
    this.data.zoomControlsBottom = this.data.electionLabelBottom;

    this.data.zoomControlsStyle = {
      height: this.data.electionLabelHeight,
      width: this.data.electionLabelWidth - 20,
      left: this.data.electionLabelLeft,
      bottom: this.data.electionLabelBottom
    };

    this.data.nextPreviousButtonHeight = this.data.electionLabelHeight * 6/12;
    this.data.nextPreviousButtonYOffset = this.data.electionLabelHeight * 3/12;

    this.data.mapLegendWidth = this.data.sidebarWidth;
    this.data.mapLegendHeight = this.data.timelineHeight;
    this.data.mapLegendTopGutter = this.data.mapLegendHeight * 1/12;
    this.data.mapLegendRadius = this.data.mapLegendHeight / 24;
    this.data.mapLegendLabelGutter = this.data.mapLegendRadius / 2;
    this.data.mapLegendElementHeight = this.data.mapLegendHeight / 12;
    this.data.mapLegendFontSize = this.data.mapLegendHeight / 12;
    this.data.mapLegendSymbolHeight = this.data.mapLegendFontSize;

    this.data.timelineYAxisWidth = Math.max(60, this.data.windowWidth / 100);

    this.data.timelineWidth = this.data.windowWidth - this.data.sidebarWidth * 2 - this.data.timelineYAxisWidth - this.data.gutterPadding * 2;
    this.data.timelineHorizontalGutter = this.data.timelineHeight * 1/12;
    this.data.timelineSteamgraphHeight = this.data.timelineHeight * 9/12;
    this.data.timelineSteamgraphGutter = this.data.timelineSteamgraphHeight * 0.02;
    this.data.timelineAxisHeight = this.data.timelineHeight * 2/12;
    this.data.timelineAxisGutter = this.data.timelineAxisHeight * 1/12;
    this.data.timelineAxisLongTickHeight = this.data.timelineAxisHeight * 3/12;
    this.data.timelineAxisShortTickHeight = this.data.timelineAxisHeight * 2/12;
    this.data.timelineAxisFontSize = this.data.timelineAxisHeight * 4/12;
    this.data.timelineAxisFontSizeSelected = this.data.timelineAxisHeight * 9/12;
    this.data.timelineElectionFontSize = this.data.timelineHorizontalGutter * 7/12;
    this.data.timelineCongressFontSize = this.data.timelineHorizontalGutter * 5/12;
    this.data.timelineAxisOffsetForDistrict = this.data.timelineAxisLongTickHeight + this.data.timelineSteamgraphGutter * 2;

    this.data.districtR = Math.min(
      this.data.mapWidth / 960 * 1000,
      this.data.mapHeight / 500 * 1000
    ) / 960 / this.data.mapScale * 4.8;

    this.data.cityLabelFontSize = this.data.districtR * 1.5;

    this.data.vizControlsRight =  this.data.gutterPadding*2 + this.data.mapWidth/2;
    this.data.vizControlsTop = this.data.headerHeight + this.data.navHeight;
    this.data.winnerControlLeft = this.data.gutterPadding*2 + this.data.mapWidth/2;

    this.data.textTop = this.data.headerHeight + this.data.navHeight;
    this.data.textBottom = this.data.gutterPadding;
    this.data.textLeft = this.data.sidebarWidth;
    this.data.textRight = this.data.sidebarWidth;
    this.data.textCloseTop = this.data.textTop + 10;
    this.data.textCloseRight = this.data.electionLabelLeft;

    this.data.textAreaStyle = {
      top: this.data.textTop,
      bottom: this.data.textBottom,
      left: this.data.textLeft,
      right: this.data.textRight
    };

    this.emit(AppActionTypes.storeChanged);
  },

  getMapDimensions: function() {
    return {
      width: this.data.mapWidth,
      height: this.data.mapHeight
    };
  },

  getMapScale: function () {
    // albers default scale is 960 x 500
    // the 0.9 gives some padding along the top and bottom of the map
    const horizontalScale = this.data.mapWidth / 960 * 1075;
    const verticalScale = this.data.mapHeight * 0.9 / 500 * 1075;
    return Math.min(horizontalScale, verticalScale);
  },

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
      .domain([1840, 2014])
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
