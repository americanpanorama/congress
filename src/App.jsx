// import node modules
import * as React from 'react';

import * as d3 from 'd3';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForParty, getColorForMargin, yearForCongress, congressForYear, ordinalSuffixOf } from './utils/HelperFunctions';

import Bubble from './components/Bubble.jsx';
import District from './components/District.jsx';
import VizControls from './components/VizControls.jsx';
import StateDistGraph from './components/StateDistGraph.jsx';
import Timeline from './components/Timeline.jsx';
import ZoomControls from './components/ZoomControls.jsx';

import DistrictsStore from './stores/Districts';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    // initialize state
    const theHash = HashManager.getState();
    const [x,y,z] = (theHash.xyz) ? theHash.xyz.split('/') : [0,0,1];
    this.state = {
      selectedYear: theHash.year || 1952,
      selectedView: theHash.view || 'cartogram',
      winnerView: theHash.show == 'winner',
      dorling: theHash.view != 'map',
      zoom: z,
      x: x,
      y: y,
    };

    // bind handlers
    const handlers = ['onYearSelected', 'onViewSelected', 'toggleDorling', 'toggleView', 'storeChanged', 'onZoomIn', 'zoomOut', 'resetView', 'handleMouseUp', 'handleMouseDown', 'handleMouseMove'];
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
    this.setState({
      x: DimensionsStore.getDimensions().mapWidth/2,
      y: DimensionsStore.getDimensions().mapHeight/2,
    });
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

  onZoomIn(event) {
    event.preventDefault();
    const z = Math.min(this.state.zoom * 1.62, 18),
      centerX = (event.target.id == 'zoomInButton') ? DimensionsStore.getMapDimensions().width  / 2 - this.state.x : event.nativeEvent.offsetX - this.state.x,
      centerY = (event.target.id == 'zoomInButton') ? DimensionsStore.getMapDimensions().height  / 2 - this.state.y : event.nativeEvent.offsetY - this.state.y,
      x = DimensionsStore.getMapDimensions().width  / 2 - centerX / this.state.zoom * z,
      y = DimensionsStore.getMapDimensions().height / 2 - centerY / this.state.zoom * z;
    this.setState({
      zoom: z,
      x: x,
      y: y
    });
  }

  zoomOut() {
    const z = Math.max(this.state.zoom / 1.62, 1),
      x = DimensionsStore.getMapDimensions().width  / 2 - (DimensionsStore.getMapDimensions().width  / 2 - this.state.x) / this.state.zoom * z,
      y = DimensionsStore.getMapDimensions().height  / 2 - (DimensionsStore.getMapDimensions().height  / 2 - this.state.y) / this.state.zoom * z;
    this.setState({
      zoom: z,
      x: x,
      y: y
    });
  }

  handleMouseUp() {
    this.dragging = false;
    this.coords = {};
  }

  handleMouseDown(e) {
    this.dragging = true;
    //Set coords
    this.coords = {x: e.pageX, y:e.pageY};
  }

  handleMouseMove(e) {
    //If we are dragging
    if (this.dragging) {
      e.preventDefault();
      //Get mouse change differential
      var xDiff = this.coords.x - e.pageX,
        yDiff = this.coords.y - e.pageY;
      //Update to our new coordinates
      this.coords.x = e.pageX;
      this.coords.y = e.pageY;
      //Adjust our x,y based upon the x/y diff from before
      var x = this.state.x - xDiff,       
        y = this.state.y - yDiff,
        z = this.state.zoom;
      //Re-render
      this.setState({
        zoom: z,
        x: x,
        y: y
      });
    }
  }


  // zoomToState(e) {
  //   const b = GeographyStore.getBoundsForState(e.target.id),
  //     centroid = GeographyStore.getCentroidForState(e.target.id),
  //     z = .8 / Math.max((b[1][0] - b[0][0]) / DimensionsStore.getMainPaneWidth(), (b[1][1] - b[0][1]) / DimensionsStore.getNationalMapHeight()),
  //     x = (DimensionsStore.getMainPaneWidth() / 2) - (DimensionsStore.getMainPaneWidth() * z * (centroid[0] / DimensionsStore.getMainPaneWidth())),
  //     y = (DimensionsStore.getNationalMapHeight() / 2) - (DimensionsStore.getNationalMapHeight() * z * (centroid[1] /  DimensionsStore.getNationalMapHeight()));
  //   AppActions.mapMoved(x,y,z);
  // }

  resetView() { 
    this.setState({
      zoom: 1,
      x: DimensionsStore.getMapDimensions().width/2,
      y: DimensionsStore.getMapDimensions().height/2
    });
  }

  toggleView(e) { this.setState({ winnerView: !this.state.winnerView }); }

  toggleDorling() { 
    this.setState({ dorling: !this.state.dorling }); 
  }

  changeHash () {
    const vizState = { 
      year: this.state.selectedYear,
      view: this.state.selectedView,
      xyz: [this.state.x, this.state.y, this.state.zoom].join('/'),
      show: (this.state.winnerView) ? 'winner' : 'strength'
    };

    HashManager.updateHash(vizState);
  }

  render () {
    //console.log(DistrictsStore.getPartyDistributionByStateOrganized(this.state.selectedYear));

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
            onDoubleClick={ this.onZoomIn }
            onMouseUp={this.handleMouseUp }
            onMouseDown={this.handleMouseDown }
            onMouseMove={this.handleMouseMove }
            transform={ 'translate(' + this.state.x + ' ' + this.state.y + ') scale(' + this.state.zoom + ')' }
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
                    fillOpacity={ (this.state.selectedView =='cartogram') ? 0.1 : 1 }
                    stroke={ 'white' }
                    strokeWidth={0.5}
                    strokeOpacity={(this.state.selectedView =='cartogram') ? 0.00 : 1}
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
                    cityLabel={ d.id }
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
                    stroke={ (this.state.selectedView == 'map') ? 'transparent' : getColorForParty(d.regularized_party_of_victory) }
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

        <ZoomControls
          onZoomIn={ this.onZoomIn }
          onZoomOut={ this.zoomOut }
          resetView={ this.resetView }
        />

        <VizControls
          selectedView={ this.state.selectedView }
          onViewSelected={ this.onViewSelected }
          toggleView={ this.toggleView }
        />

        <aside 
          id='sidebar'
          style={{ height: DimensionsStore.getDimensions().sidebarHeight }}
        >

          <Timeline
            partyCount={ DistrictsStore.getPartyCounts() }
            congressYears={ DistrictsStore.getCongressYears() }
            onYearSelected={ this.onYearSelected }
            selectedYear={ this.state.selectedYear }
            partyCountForSelectedYear={ DistrictsStore.getRawPartyCounts(this.state.selectedYear) }
          />


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
          <div>
            <h2>Election of { this.state.selectedYear }: The { ordinalSuffixOf(congressForYear(this.state.selectedYear)) } Congress</h2>
          </div>
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