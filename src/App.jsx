// import node modules
import * as React from 'react';

import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import ToggleButton from 'react-toggle-button'

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForParty, getColorForMargin, yearForCongress, congressForYear, getStateName, ordinalSuffixOf } from './utils/HelperFunctions';

import Bubble from './components/Bubble.jsx';
import District from './components/District.jsx';
import StateDistGraph from './components/StateDistGraph.jsx';
import Timeline from './components/Timeline.jsx';
import DistrictTimeline from './components/DistrictTimeline.jsx';
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
      selectedDistrict: theHash.district || null,
      onlyFlipped: false,
      inspectedDistrict: null,
      winnerView: theHash.show == 'winner',
      dorling: theHash.view != 'map',
      zoom: z,
      x: x,
      y: y,
    };

    // bind handlers
    const handlers = ['onYearSelected', 'onViewSelected', 'toggleDorling', 'toggleView', 'storeChanged', 'onZoomIn', 'zoomOut', 'resetView', 'handleMouseUp', 'handleMouseDown', 'handleMouseMove', 'onDistrictInspected', 'onDistrictUninspected', 'onDistrictSelected', 'onPartySelected','toggleFlipped'];
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
    const year = e.target.id;
    AppActions.congressSelected(year);
    console.time();
    this.setState({
      inspectedDistrict: null
    });
    // don't set state until the districts have been loaded
    let loading = setInterval(() => {
      if (DistrictsStore.hasYearLoaded(year)) {
        clearInterval(loading);
        const selectedDistrict = (this.state.selectedDistrict) ? DistrictsStore.getDistrictId(year, DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, this.state.selectedDistrict).id) : null;
        this.setState({ 
          selectedYear: year,
          selectedDistrict: selectedDistrict
        }); 
      }
    }, 50);
  }

  onPartySelected(e) { 
    const selectedParty = (e.currentTarget.id == this.state.selectedParty) ? null : e.currentTarget.id;
    this.setState({ selectedParty: selectedParty }); 
  }

  onDistrictInspected(e) {
    this.setState({ inspectedDistrict: e.target.id }); 
  }

  onDistrictUninspected() {
    this.setState({ inspectedDistrict: null }); 
  }

  onDistrictSelected(e) {
    this.setState({ selectedDistrict: e.target.id }); 
  }

  toggleFlipped() { this.setState({ onlyFlipped: !this.state.onlyFlipped }); }

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
      centerX = (event.currentTarget.id == 'zoomInButton') ? DimensionsStore.getMapDimensions().width  / 2 - this.state.x : event.nativeEvent.offsetX - this.state.x,
      centerY = (event.currentTarget.id == 'zoomInButton') ? DimensionsStore.getMapDimensions().height  / 2 - this.state.y : event.nativeEvent.offsetY - this.state.y,
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
      district: this.state.selectedDistrict,
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

    let viewableDistrict = this.state.inspectedDistrict || this.state.selectedDistrict,
      transitionDuration = (this.state.inspectedDistrict) ? 0 : 750;

    return (
      <div>
        <header
          style={{
            height: DimensionsStore.getDimensions().headerHeight,
            width: DimensionsStore.getDimensions().mapWidth,
            margin: DimensionsStore.getDimensions().gutterPadding
          }}
        >
          <h1 style={{ 
            fontSize: DimensionsStore.getDimensions().headerTitleFontSize,
            marginTop: DimensionsStore.getDimensions().headerGutter
          }}>The People's House</h1>
          <h2 style={{ 
            fontSize: DimensionsStore.getDimensions().headerSubtitleFontSize,
            marginTop: DimensionsStore.getDimensions().headerGutter
          }}>Electing the House of Representatives</h2>
        </header>
        <svg 
          width={ DimensionsStore.getDimensions().mapWidth }
          height={ DimensionsStore.getDimensions().mapHeight }
          className='theMap'
        >

          <filter id="glow" x="-50%" y="-10%" width="200%" height="160%">
            <feGaussianBlur stdDeviation="10" result="glow"/>
          </filter>

          <filter id="blur" x="-50%" y="-10%" width="200%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
          </filter>

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
              { (true || this.state.selectedView == 'map') ?
                <g>
                  { DistrictsStore.getElectionDistricts(this.state.selectedYear).map(d => {
                    return (
                      <District
                        d={ DistrictsStore.getPath(d.the_geojson) }
                        key={ 'polygon' + d.id }
                        fill={ (this.state.winnerView || this.state.selectedView =='cartogram') ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote) }
                        //fillOpacity={ (this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory) ? 0.05 : (this.state.selectedView =='cartogram') ? 0.1 : 1 }
                        fillOpacity={ (this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory) ? 0.05 : ((this.state.selectedView == 'cartogram' && viewableDistrict !== d.id) || (viewableDistrict && viewableDistrict !== d.id) || (this.state.onlyFlipped && !d.flipped)) ? 0.1 : 1 }
                        stroke={ '#eee' }
                        strokeWidth={(!viewableDistrict || viewableDistrict != d.id) ? 0.5 : 2 }
                        strokeOpacity={(this.state.selectedView =='cartogram' && (!viewableDistrict || viewableDistrict !== d.id)) ? 0.00 : (viewableDistrict && viewableDistrict !== d.id) ? 0.2 : 1}
                        selectedView={ this.state.selectedView }
                        onDistrictInspected={ this.onDistrictInspected }
                        onDistrictUninspected={ this.onDistrictUninspected }
                        onDistrictSelected={ this.onDistrictSelected }
                        id={d.id}
                        duration={ transitionDuration }
                        pointerEvents={ (this.state.selectedView == 'map') ? 'auto' : 'none'}
                      />
                    );
                  })}
                </g> : ''
              }


              { DistrictsStore.getStates(this.state.selectedYear).map(s => {
                return ( <path
                  d={ DistrictsStore.getPath(s.geometry) }
                  fill='transparent'
                  stroke={ '#eee'}
                  strokeOpacity={ (this.state.selectedView =='cartogram') ? 0.2 : 1 }
                  strokeWidth={ (!viewableDistrict || s.properties.abbr_name == DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).state) ? 1.5 : 0.3 }
                  key={'stateBoundaries'+s.properties.name}
                  filter={ (this.state.selectedView == 'cartogram') ? 'url(#blur)' : '' }
                  style={{ pointerEvents: 'none' }}
                />);

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
                    color='#11181b'
                    fillOpacity={0.8}
                    stroke={ (this.state.selectedView == 'map') ? 'transparent' : 'transparent' }
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
                    stroke={ (this.state.selectedView == 'map' || (this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory)) ? 'transparent' : (this.state.selectedView == 'cartogram' && viewableDistrict && viewableDistrict == d.districtId) ? 'white' : getColorForParty(d.regularized_party_of_victory) }
                    fillOpacity={ ((this.state.selectedParty && this.state.selectedParty !== d.regularized_party_of_victory) || (this.state.onlyFlipped && !d.flipped)) ? 0.05 : (viewableDistrict && viewableDistrict !== d.districtId) ? 0.3 : 1 }
                    label={ (d.flipped && (!this.state.selectedParty || this.state.selectedParty == d.regularized_party_of_victory)) ? 'F' : ''}
                    labelColor={ getColorForParty(d.regularized_party_of_victory) }
                    key={d.id}
                    id={d.districtId}
                    pointerEvents={ (this.state.selectedView == 'map') ? 'none' : 'auto' }
                    selectedView={ this.state.selectedView }
                    onDistrictInspected={ this.onDistrictInspected }
                    onDistrictUninspected={ this.onDistrictUninspected }
                    onDistrictSelected={ this.onDistrictSelected }
                  />
                )} 
              </g> : ''
            }

          </g>
        </svg>



        <MapLegend
          selectedView={ this.state.selectedView }
          selectedParty={ this.state.selectedParty }
          onViewSelected={ this.onViewSelected }
          onPartySelected={ this.onPartySelected }
          winnerView={ this.state.winnerView }
          onlyFlipped={ this.state.onlyFlipped }
          toggleView={ this.toggleView }
          toggleFlipped={ this.toggleFlipped }
        />

        <ZoomControls
          onZoomIn={ this.onZoomIn }
          onZoomOut={ this.zoomOut }
          resetView={ this.resetView }
          currentZoom={ this.state.zoom }
        />




        <aside
          id='info'
          style={{ 
            width: DimensionsStore.getDimensions().timelineWidth,
            height: DimensionsStore.getDimensions().timelineHeight,
            bottom: DimensionsStore.getDimensions().gutterPadding,
            left: DimensionsStore.getDimensions().sidebarWidth + DimensionsStore.getDimensions().gutterPadding * 2,
          }}
        >
          <Timeline
            partyCount={ DistrictsStore.getPartyCounts() }
            partyCountKeys={ DistrictsStore.getPartyCountsKeys() }
            topOffset={ DistrictsStore.getMaxTopOffset() }
            bottomOffset={ DistrictsStore.getMaxBottomOffset() }
            congressYears={ DistrictsStore.getCongressYears() }
            onYearSelected={ this.onYearSelected }
            selectedYear={ this.state.selectedYear }
            partyCountForSelectedYear={ DistrictsStore.getRawPartyCounts(this.state.selectedYear) }
            districtData={ (viewableDistrict) ? DistrictsStore.getSpatialIdData(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).id) : false }
          />

          { (false && viewableDistrict) ? 
            <DistrictTimeline
              electionsData={ DistrictsStore.getSpatialIdData(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).id) }
              topOffset={ DistrictsStore.getMaxTopOffset() }
              bottomOffset={ DistrictsStore.getMaxBottomOffset() }
            /> : ''
          }




        </aside>

        <div 
          id='vizControl' 
          style={{
            right: DimensionsStore.getDimensions().vizControlsRight,
            fontSize: DimensionsStore.getDimensions().headerSubtitleFontSize,
            verticalAlign: 'top',
            lineHeight: '1em'
          }}
        >
          <span style={{ 
              color: (this.state.selectedView == 'cartogram') ? '#F0B67F' : '#aaa',
              verticalAlign: 'top',
              lineHeight: '1em'
            }} 
            onClick={ this.onViewSelected }
          >
            Cartogram
          </span>
          <ToggleButton
            value={ this.state.selectedView == 'map' }
            onToggle={ this.onViewSelected }
            inactiveLabel={''}
            activeLabel={''}
            containerStyle={{
              display:'inline-block',
              //transform: 'translateY(5px)',
              width: DimensionsStore.getDimensions().vizControlTrackHeight * 2,
              marginRight: 5,
              marginLeft: 5,
            }} 
            colors={{
              activeThumb: { base: '#eee' },
              inactiveThumb: { base: '#eee' },
              active: { base: '#777' },
              inactive: { base: '#777' }
            }}
            activeLabelStyle={{ fontSize: 1 }}
            inactiveLabelStyle={{ fontSize: 1 }}
            trackStyle={{
              height: DimensionsStore.getDimensions().vizControlTrackHeight,
              width: DimensionsStore.getDimensions().vizControlTrackHeight * 2
            }}
            thumbStyle={{
              height: DimensionsStore.getDimensions().vizControlTrackHeight ,
              width: DimensionsStore.getDimensions().vizControlTrackHeight,
            }}
            thumbAnimateRange={[0, DimensionsStore.getDimensions().vizControlTrackHeight]}
          />
          <span 
            style={{ 
              color: (this.state.selectedView == 'map') ? '#F0B67F' : '#aaa',
              verticalAlign: 'top',
              lineHeight: '1em'
            }} 
            onClick={ this.onViewSelected }
          >
            Map
          </span>
        </div>

        <div 
          id='winnerControl'
          style={{
            left: DimensionsStore.getDimensions().winnerControlLeft,
            fontSize: DimensionsStore.getDimensions().headerSubtitleFontSize,
            verticalAlign: 'top',
            lineHeight: '1em'
          }}
        >
          <span 
            style={{ 
              color: (this.state.winnerView) ? '#F0B67F' : '#aaa',
              fontSize: DimensionsStore.getDimensions().headerSubtitleFontSize,
              verticalAlign: 'top',
              lineHeight: '1em'
            }} 
            onClick={ this.toggleView }
          >
            Winner </span>
          <ToggleButton
            value={ !this.state.winnerView }
            onToggle={ this.toggleView }
             inactiveLabel={''}
            activeLabel={''}
            containerStyle={{
              display:'inline-block',
              //transform: 'translateY(5px)',
              width: DimensionsStore.getDimensions().vizControlTrackHeight * 2,
              marginRight: 5,
              marginLeft: 5,
            }} 
            colors={{
              activeThumb: { base: '#eee' },
              inactiveThumb: { base: '#eee' },
              active: { base: '#777' },
              inactive: { base: '#777' }
            }}
            activeLabelStyle={{ fontSize: 1 }}
            inactiveLabelStyle={{ fontSize: 1 }}
            trackStyle={{
              height: DimensionsStore.getDimensions().vizControlTrackHeight,
              width: DimensionsStore.getDimensions().vizControlTrackHeight * 2
            }}
            thumbStyle={{
              height: DimensionsStore.getDimensions().vizControlTrackHeight ,
              width: DimensionsStore.getDimensions().vizControlTrackHeight,
            }}
            thumbAnimateRange={[0, DimensionsStore.getDimensions().vizControlTrackHeight]}
          />
          <span 
            style={{ 
              color: (!this.state.winnerView) ? '#F0B67F' : '#aaa',
              fontSize: DimensionsStore.getDimensions().headerSubtitleFontSize,
              verticalAlign: 'top',
              lineHeight: '1em'
            }} 
            onClick={ this.toggleView }> Strength of Victory</span>
        </div>

        <h2
          id='electionLabel'
          style={{ 
            width: DimensionsStore.getDimensions().electionLabelWidth,
            height: DimensionsStore.getDimensions().electionLabelHeight,
            left: DimensionsStore.getDimensions().electionLabelLeft,
            bottom: DimensionsStore.getDimensions().electionLabelBottom,


          }}
        >
          Election of { this.state.selectedYear }: The { ordinalSuffixOf(congressForYear(this.state.selectedYear)) } Congress
        </h2>



        <aside 
          id='sidebar'
          style={{ 
            width: DimensionsStore.getDimensions().sidebarWidth,
            height: DimensionsStore.getDimensions().sidebarHeight,
            left: DimensionsStore.getDimensions().sidebarLeft,
            bottom: DimensionsStore.getDimensions().sidebarBottom,
          }}
        >
          { (viewableDistrict) ?
            <div>
              <div>Victor: { DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).victor }</div>

            </div> : ''
          }
        </aside>

        <h2
          id='districtLabel'
          style={{ 
            width: DimensionsStore.getDimensions().districtLabelWidth,
            height: DimensionsStore.getDimensions().districtLabelHeight,
            left: DimensionsStore.getDimensions().districtLabelLeft,
            bottom: DimensionsStore.getDimensions().districtLabelBottom,
            backgroundColor: (!viewableDistrict) ? '#38444a' : getColorForParty(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).regularized_party_of_victory)
          }}
        >
          { (viewableDistrict) ? getStateName(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).state) + ' ' + DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).district : ' '
          }
        </h2>
      </div>
    );
  }

}

export default App;