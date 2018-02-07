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
		sidebarWidth: 250,
		sidebarHeight: 100, // placeholder
		infoWidth: 100,
		infoHeight: 200,
	},

	computeComponentDimensions () {
		this.data.windowHeight = window.innerHeight;
		this.data.windowWidth = window.innerWidth;
		this.data.sidebarHeight =this.data.windowHeight - this.data.headerHeight;
		this.data.infoWidth = this.data.windowWidth - this.data.sidebarWidth;

		this.data.mapHeight = this.data.windowHeight - this.data.headerHeight - this.data.gutterPadding * 2;
		this.data.mapWidth = this.data.windowWidth - this.data.gutterPadding * 2;

		this.data.districtR = Math.min(this.data.mapWidth/960* 1000, this.data.mapHeight/500 * 1000) / 960 * 5;

		this.emit(AppActionTypes.storeChanged);
	},

	getMapDimensions: function() {
		return {
			width: 960,
			height: 500
		};
	},

	getMapScale: function() { return Math.min(this.data.mapWidth/960* 1000, this.data.mapHeight/500 * 1000); },

	getDimensions: function() { return this.data; }



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