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
		sidebarWidth: 400,
		sidebarHeight: 100, // placeholder
		infoWidth: 100,
		infoHeight: 200,
		timelineHeight: window.innerHeight - 100,
		timelineWidth: 350,
	},

	computeComponentDimensions () {
		this.data.windowHeight = window.innerHeight;
		this.data.windowWidth = window.innerWidth;
		this.data.sidebarHeight =this.data.windowHeight - this.data.headerHeight;
		this.data.infoWidth = this.data.windowWidth - this.data.sidebarWidth;

		this.data.mapHeight = this.data.windowHeight - this.data.headerHeight - this.data.gutterPadding * 2;
		this.data.mapWidth = this.data.windowWidth - this.data.timelineWidth - this.data.gutterPadding * 2;

		this.data.timelineHeight = this.data.windowHeight - this.data.headerHeight - this.data.gutterPadding * 2;

		this.data.districtR = Math.min(this.data.mapWidth/960* 1000, this.data.mapHeight/500 * 1000) / 960 * 5;

		this.emit(AppActionTypes.storeChanged);
	},

	getMapDimensions: function() {
		return {
			width: this.data.mapWidth,
			height: this.data.mapHeight
		};
	},

	getMapScale: function() { return Math.min(this.data.mapWidth/960* 1000, this.data.mapHeight/500 * 1000); },

	getDimensions: function() { return this.data; },

	getSVGArc(padding, radius, sweepFlag) {
		sweepFlag = (sweepFlag) ? sweepFlag : 1; 
		return 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ',' + (radius-padding) + ' 0 0, ' + sweepFlag + ' ' + (radius*2 - padding) + ',' + radius; 
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