import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import d3 from 'd3';

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

		this.data.sidebarHeight =this.data.windowHeight - this.data.headerHeight - this.data.gutterPadding;
		this.data.sidebarWidth = this.data.windowWidth / 4 - this.data.gutterPadding * 1.5;
		this.data.infoWidth = this.data.windowWidth - this.data.sidebarWidth;

		this.data.mapHeight = this.data.windowHeight * 2/3 - this.data.gutterPadding;
		this.data.mapWidth = this.data.windowWidth * 3/4 - this.data.gutterPadding * 1.5;

		this.data.vizControlTrackHeight = this.data.headerSubtitleFontSize * 0.8;

		this.data.mapLegendHeight = this.data.mapHeight / 12;
		this.data.mapLegendGutter = this.data.mapLegendHeight * 0.02;
		this.data.mapLegendFontSize = this.data.mapLegendHeight / 4 - this.data.mapLegendGutter;
		this.data.mapLegendSymbolHeight = this.data.mapLegendFontSize;

		this.data.timelineWidth = this.data.mapWidth;
		this.data.timelineHeight = this.data.windowHeight / 4 - this.data.gutterPadding * 1.5;

		this.data.districtR = Math.min(this.data.mapWidth/960* 1000, this.data.mapHeight/500 * 1000) / 960 * 5;

		this.data.vizControlsRight = this.data.sidebarWidth + this.data.gutterPadding*3 + this.data.mapWidth/2;
		this.data.winnerControlLeft = this.data.gutterPadding*2 + this.data.mapWidth/2;

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
		const xEnd = (radius - (radius-12) * Math.cos(0.2)),
			yEnd = Math.abs(radius + (radius-12) * Math.sin(0.2));
		return 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ' ' + (radius-padding) + ', 0 1, ' + sweepFlag + ' ' + xEnd + ',' + yEnd; 
	},

	getTitleLabelArc(radius) { return this.getSVGArc(12, radius); },



}

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