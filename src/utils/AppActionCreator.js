import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  loadInitialData: 'loadInitialData',
  congressSelected: 'congressSelected',
  onModalClick: 'onModalClick',
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

  onModalClick: (subject) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.onModalClick,
      subject: subject
    });
  },

  windowResized: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.windowResized
    });
  }

};
