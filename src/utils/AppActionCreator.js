import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  loadInitialData: 'loadInitialData',
  districtSelected: 'districtSelected',
  congressSelected: 'congressSelected',
  congressLoaded: 'congressLoaded',
  storeChanged: 'storeChanged',
  windowResized: 'windowResized'

};

export const AppActions = {

  loadInitialData: (state, hashState) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.loadInitialData,
      state: state,
      hashState: hashState
    });
  },

  congressSelected: (year, selectedDistrict) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.congressSelected,
      year: year,
      selectedDistrict: selectedDistrict
    });
  },

  congressLoaded: (year, selectedDistrict) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.congressLoaded,
      year: year,
      selectedDistrict: selectedDistrict
    });
  },

  districtSelected: (id) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.districtSelected,
      id: id
    });
  },

  windowResized: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.windowResized
    });
  }

};
