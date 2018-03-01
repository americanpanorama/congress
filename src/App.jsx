// import node modules
import * as React from 'react';

import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForParty, getColorForMargin, yearForCongress, congressForYear, getStateName, ordinalSuffixOf } from './utils/HelperFunctions';

import Bubble from './components/Bubble.jsx';
import District from './components/District.jsx';
import StateDistGraph from './components/StateDistGraph.jsx';
import Timeline from './components/Timeline.jsx';
import ZoomControls from './components/ZoomControls.jsx';
import MapLegend from './components/MapLegend.jsx';

import DistrictsStore from './stores/Districts';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

import StatesTopoJson from '../data/states.json';

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
      selectedParty: null,
      selectedDistrict: null,
      inspectedDistrict: null,
      winnerView: theHash.show == 'winner',
      dorling: theHash.view != 'map',
      zoom: z,
      x: x,
      y: y,
    };

    // bind handlers
    const handlers = ['onYearSelected', 'onViewSelected', 'toggleDorling', 'toggleView', 'storeChanged', 'onZoomIn', 'zoomOut', 'resetView', 'handleMouseUp', 'handleMouseDown', 'handleMouseMove', 'onDistrictInspected', 'onDistrictUninspected', 'onPartySelected'];
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

  onPartySelected(e) { 
    const selectedParty = (e.target.id == this.state.selectedParty) ? null : e.target.id;
    this.setState({ selectedParty: selectedParty }); 
  }

  onDistrictInspected(e) {
    this.setState({ inspectedDistrict: e.target.id }); 
  }

  onDistrictUninspected() {
    this.setState({ inspectedDistrict: null }); 
  }

  onViewSelected(e) {
    const selectedView = (this.state.selectedView == 'map') ? 'cartogram' : 'map';
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
    if (this.state.inspectedDistrict) {
      let id = DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, this.state.inspectedDistrict).id;
      DistrictsStore.getPreviousAndNext3(this.state.selectedYear, id);
    }
    //console.log(DistrictsStore.getPreviousElectionYear(this.state.selectedYear));

    return (
      <div>
        <header>
          <h1>The People's House: Electing the House of Representatives</h1>
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
                    fillOpacity={ (this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory) ? 0.05 : (this.state.selectedView =='cartogram') ? 0.1 : 1 }
                    stroke={ '#eee' }
                    strokeWidth={0.5}
                    strokeOpacity={(this.state.selectedView =='cartogram') ? 0.00 : 1}
                    selectedView={ this.state.selectedView }
                  />
                );
              })}

              { DistrictsStore.getStates(this.state.selectedYear).map(s =>
                <path
                  d={ DistrictsStore.getPath(s.geometry) }
                  fill='transparent'
                  stroke='#eee'
                  strokeWidth={ 1.5 }
                  key={'stateBoundaries'+s.properties.name}
                />
              )}

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
                    stroke={ (this.state.selectedView == 'map' || (this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory)) ? 'transparent' : getColorForParty(d.regularized_party_of_victory) }
                    fillOpacity={ (this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory) ? 0.05 : (this.state.inspectedDistrict && this.state.inspectedDistrict !== d.districtId ) ? 0.3 : 1 }
                    label={ (d.flipped && (!this.state.selectedParty || this.state.selectedParty == d.regularized_party_of_victory)) ? 'F' : ''}
                    labelColor={ getColorForParty(d.regularized_party_of_victory) }
                    key={d.id}
                    id={d.districtId}
                    selectedView={ this.state.selectedView }
                    onDistrictInspected={ this.onDistrictInspected }
                    onDistrictUninspected={ this.onDistrictUninspected }
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

        <MapLegend
          selectedView={ this.state.selectedView }
          onViewSelected={ this.onViewSelected }
          onPartySelected={ this.onPartySelected }
          winnerView={ this.state.winnerView }
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
        </aside>

        <aside
          id='info'
          style={{ width: DimensionsStore.getDimensions().infoWidth }}
        >
          <Timeline
            partyCount={ DistrictsStore.getPartyCounts() }
            congressYears={ DistrictsStore.getCongressYears() }
            onYearSelected={ this.onYearSelected }
            selectedYear={ this.state.selectedYear }
            partyCountForSelectedYear={ DistrictsStore.getRawPartyCounts(this.state.selectedYear) }
          />


          <h2>
            { (DistrictsStore.getPreviousElectionYear(this.state.selectedYear)) ? 
              <span onClick={this.onYearSelected} id={DistrictsStore.getPreviousElectionYear(this.state.selectedYear)}>«</span> : ''
            }
            Election of { this.state.selectedYear }: The { ordinalSuffixOf(congressForYear(this.state.selectedYear)) } Congress
            { (DistrictsStore.getNextElectionYear(this.state.selectedYear)) ? 
              <span onClick={this.onYearSelected} id={DistrictsStore.getNextElectionYear(this.state.selectedYear)}>»</span> : ''
            }
          </h2>

          { (this.state.inspectedDistrict) ?
            <div>
              <h3>{ getStateName(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, this.state.inspectedDistrict).state) + ' ' + DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, this.state.inspectedDistrict).district}</h3>
              <div>Party: { DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, this.state.inspectedDistrict).regularized_party_of_victory }</div>


            </div> : ''
          }

        </aside>
      </div>
    );
  }

}

export default App;