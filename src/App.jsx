// import node modules
import * as React from 'react';

import * as d3 from 'd3';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForParty, getColorForMargin, yearForCongress } from './utils/HelperFunctions';

import Bubble from './components/Bubble.jsx';
import District from './components/District.jsx';
import VizControls from './components/VizControls.jsx';
import StateDistGraph from './components/StateDistGraph.jsx';

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
    //console.log(DistrictsStore.getPartyDistributionByStateOrganized(this.state.selectedYear));

    var y = d3.scaleLinear()
      .domain([1860, 1996])
      .range([1000, 0]);
    var x = d3.scaleLinear()
      .domain([-350, 350])
      .range([-100, 100]);
    var area = d3.area()
      .y(d => y(d.data.year))
      .x0(d => x(d[0]))
      .x1(d => x(d[1]))
      .curve(d3.curveCatmullRom);


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
          <svg 
            width={200}
            height={1000}
          >
            <g transform='translate(100 0)'>

            { DistrictsStore.getPartyCounts().map((partyCount, i) => 
              <path
                d={area(partyCount)}
                fill={(i <= 10) ? getColorForParty('democrat') : (i == 11) ? getColorForMargin('democrat', 0.8) : (i == 12) ? 'green' : (i == 13) ? getColorForMargin('republican', 0.8) : getColorForParty('republican')}
                key={'timelineParty' + i}
              />
            )}
            

            { DistrictsStore.getCongressYears().map(year => 
              <text
                x={0}
                y={y(year)}
                fill='white'
                textAnchor='middle'
                key={'year' + year}
              >
                {(year %10 == 0) ? year : '•'}
              </text>
            )}

            { DistrictsStore.getCongressYears().map(year => 
              <rect
                x={-100}
                y={y(year)}
                width={200}
                height={y(1860) - y(1862)}
                stroke='#999'
                strokeWidth={0}
                fill='transparent'
                key={'clickbox'+year}
                id={year}
                onClick={ this.onYearSelected }
              />
            )}

            </g>
          </svg>

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
          <svg
            height={600}
            width={2000}
          >
            
            { DistrictsStore.getPartyDistributionByStateOrganized(this.state.selectedYear).map(stateData => 
              <StateDistGraph
                { ...stateData }
                key={ 'graphFor' + stateData.state }
              />
            )}
          </svg>

        </aside>
      </div>
    );
  }

}

export default App;