import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  loadInitialData: 'loadInitialData',
  congressSelected: 'congressSelected',
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

  congressSelected: (year) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.congressSelected,
      year: year
    });
  },

  windowResized: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.windowResized
    });
  }

};
