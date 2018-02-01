// import node modules
import * as React from 'react';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForParty, getColorForMargin, yearForCongress } from './utils/HelperFunctions';

import Bubble from './components/Bubble.jsx';
import District from './components/District.jsx';
import VizControls from './components/VizControls.jsx';

import DistrictsStore from './stores/Districts';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      selectedYear: 1952,
      selectedView: 'cartogram',
      winnerView: false,
      dorling: true
    };

    // bind handlers
    const handlers = ['onYearSelected', 'onViewSelected', 'toggleDorling', 'toggleView', 'storeChanged'];
    handlers.forEach(handler => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () { 
    //const theHash = HashManager.getState();
    AppActions.loadInitialData(this.state, HashManager.getState());
  }

  componentDidMount () {
    //window.addEventListener('resize', this.onWindowResize);
    DistrictsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentDidUpdate () { this.changeHash(); }

  storeChanged() { this.setState({}); }

  onYearSelected(e) { 
    AppActions.congressSelected(e.target.id);
    this.setState({ selectedYear: e.target.id }); 
  }

  onViewSelected(e) {
    const selectedView = e.target.id;

    this.setState({ 
      selectedView: selectedView,
      dorling: (selectedView == 'map') ? false : (selectedView == 'cartogram') ? true : this.state.dorling,
    });
  }

  toggleView(e) { this.setState({ winnerView: !this.state.winnerView }); }

  toggleDorling() { 
    this.setState({ dorling: !this.state.dorling }); 
  }

  changeHash () {
    //let hash = {};
    //HashManager.updateHash(hash);
  }

  render () {
    console.log(DistrictsStore.getElectionDistricts(this.state.selectedYear));
    return (
      <div>
        <header>
          <h1>Congress</h1>
        </header>
        <svg 
          width={ DimensionsStore.getDimensions().mapWidth }
          height={ DimensionsStore.getDimensions().mapHeight }
          className='theMap'
        >
          <g
            { ...DimensionsStore.getMapDimensions() }
            transform={ 'translate(' + DimensionsStore.getDimensions().mapWidth/2 + ' ' + DimensionsStore.getDimensions().mapHeight/2 + ')' }
          >
            <g
              transform={ 'translate(-' + DimensionsStore.getDimensions().mapWidth/2 + ' -' + DimensionsStore.getDimensions().mapHeight/2 + ')' }
            >
              { DistrictsStore.getElectionDistricts(this.state.selectedYear).map(d => {
                return (
                  <District
                    d={ DistrictsStore.getPath(d.the_geojson) }
                    key={ 'polygon' + d.id }
                    fill={ (this.state.winnerView || this.state.selectedView =='cartogram') ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote) }
                    fillOpacity={ (this.state.selectedView =='cartogram') ? 0.05 : 1 }
                    stroke={ getColorForParty(d.regularized_party_of_victory) }
                    strokeWidth={0.1}
                    strokeOpacity={(this.state.selectedView =='cartogram') ? 0.00 : 0.25}
                    selectedView={ this.state.selectedView }
                  />
                );
              })}
            </g>

            { (true || this.state.selectedView == 'cartogram') ?
              <g>
                { DistrictsStore.getBubbleCoords(this.state.selectedYear).cities.map((d, i) => 
                  <Bubble
                    cx={(this.state.dorling) ? d.x : d.xOrigin }
                    cy={(this.state.dorling) ? d.y : d.yOrigin }
                    r={(this.state.dorling) ? d.r : 0.01 }
                    color='transparent'
                    stroke={ (this.state.selectedView == 'map') ? 'transparent' : 'black' }
                    key={d.id || 'missing' + i}
                    id={d.id}
                  />
                )}

                { DistrictsStore.getBubbleCoords(this.state.selectedYear).districts.map(d=> 
                  <Bubble
                    cx={(this.state.dorling) ? d.x : d.xOrigin }
                    cy={(this.state.dorling) ? d.y : d.yOrigin }
                    r={ DimensionsStore.getDimensions().districtR }
                    color={ (this.state.selectedView == 'map') ? 'transparent' : (this.state.winnerView) ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote)}
                    stroke={ 'transparent' }
                    label={ (d.flipped) ? 'F' : ''}
                    labelColor={ getColorForParty(d.regularized_party_of_victory) }
                    key={d.id}
                    id={d.id}
                    selectedView={ this.state.selectedView }
                  />
                )} 
              </g> : ''
            }

          </g>



        </svg>

        <VizControls
          selectedView={ this.state.selectedView }
          onViewSelected={ this.onViewSelected }
        />

        <aside 
          id='sidebar'
          style={{ height: DimensionsStore.getDimensions().sidebarHeight }}
        >
          <ul>
            { DistrictsStore.getYears().map(year => 
              <li
                id={year}
                onClick={ this.onYearSelected }
                key={'year' + year} 
              >
                {year}
              </li>
            )}
            <li onClick={ this.toggleView }>strength or winner</li>
          </ul>
        </aside>

        <aside
          id='info'
          style={{ width: DimensionsStore.getDimensions().infoWidth }}
        >
          info

        </aside>
      </div>
    );
  }

}

export default App;