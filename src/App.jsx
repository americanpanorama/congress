import * as React from 'react';
import { Typeahead } from 'react-typeahead';

import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';
import { getColorForParty, formatPersonName, displayParty } from './utils/HelperFunctions';

import Masthead from './components/Masthead';
import Navigation from './components/Navigation';
import TheMap from './components/MapContainer';
import Context from './components/Context';
import Timeline from './components/Timeline';
import TimelineHandle from './components/TimelineHandle';
import Text from './components/Text';
import ElectionLabel from './components/ElectionLabel';
import DistrictData from './components/DistrictData';
import SearchResult from './components/SearchResult';

import DistrictsStore from './stores/Districts';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {
  constructor (props) {
    super(props);

    // initialize state
    const theHash = HashManager.getState();
    const [x, y, z] = (theHash.xyz) ? theHash.xyz.split('/').map(d => parseFloat(d, 10)) : [0.5, 0.5, 1];
    this.state = {
      selectedView: theHash.view || 'cartogram',
      selectedYear: parseInt(theHash.year, 10) || 2010,
      selectedDistrict: parseInt(theHash.district) || null,
      selectedParty: theHash.party || null,
      onlyFlipped: false,
      inspectedDistrict: null,
      dorling: theHash.view !== 'map',
      zoom: z,
      x: x,
      y: y,
      textSubject: null,
      searchOpen: false,
      searching: false,
      searchOptions: []
    };

    this.search = React.createRef();

    // bind handlers
    const handlers = ['onWindowResize', 'onYearSelected', 'toggleDorling', 'storeChanged', 'onDistrictInspected', 'onDistrictUninspected', 'onDistrictSelected', 'onPartySelected', 'toggleFlipped', 'dimensionsChanged', 'onModalClick', 'onZoomIn', 'zoomOut', 'onMapDrag', 'resetView', 'onZoomToDistrict', 'onZoomInToPoint', 'onViewSelected', 'onHandleKeyPress', 'onSearching', 'onCongressLoaded', 'calculateBounds', 'onToggleSearch'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () {
    AppActions.loadInitialData(this.state, HashManager.getState());

    AppDispatcher.register((action) => {
      const updates = {};
      updates[AppActionTypes.congressLoaded] = () => {
        this.onCongressLoaded(action.year);
      };

      if (updates[action.type]) {
        updates[action.type]();
      }
    });
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onHandleKeyPress);
    DistrictsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.dimensionsChanged);

    this.searchTimer = null;
  }

  componentDidUpdate () { this.changeHash(); }

  onWindowResize () { AppActions.windowResized(); }

  onViewSelected (e) {
    const selectedView = (this.state.selectedView === 'map') ? 'cartogram' : 'map';
    this.setState({
      selectedView: selectedView
    });
  }

  onYearSelected (e) {
    const selectedYear = (e && e.currentTarget) ?
      parseInt((e.currentTarget) ? e.currentTarget.id : e, 10) : e;
    AppActions.congressSelected(selectedYear, this.state.selectedDistrict);
  }

  onCongressLoaded (year) {
    // deselect selectedDistrict if it doesn't exist in the new year
    let { selectedDistrict } = this.state;
    if (this.state.selectedDistrict) {
      const districtData = DistrictsStore.getElectionDataForDistrict(this.state.selectedDistrict);
      if (!districtData) {
        selectedDistrict = null;
      }
    }
    this.setState({
      selectedYear: year,
      selectedDistrict: (selectedDistrict) ? parseInt(selectedDistrict) : null
    });
  }

  onPartySelected (e) {
    let selectedParty;
    if (e && e.currentTarget) {
      selectedParty = (e.currentTarget.id === this.state.selectedParty) ? null : e.currentTarget.id;
    } else {
      selectedParty = e;
    }

    this.setState({
      selectedParty: selectedParty,
      selectedDistrict: null
    });
  }

  onToggleSearch () {
    this.setState({
      searchOpen: !this.state.searchOpen,
      searchOptions: (this.state.searchOpen) ? [] : this.state.searchOptions
    }, () => {
      if (this.state.searchOpen) {
        this.search.current.focus();
      }
    });
  }

  onDistrictInspected (e) {
    //this.setState({ inspectedDistrict: e.target.id });
  }

  onHandleKeyPress (e) {
    const commands = {
      ArrowRight: () => {
        this.onYearSelected(DistrictsStore.getNextElectionYear(this.state.selectedYear));
      },
      ArrowLeft: () => {
        this.onYearSelected(DistrictsStore.getPreviousElectionYear(this.state.selectedYear));
      },
      f: this.toggleFlipped,
      d: () => {
        const party = (this.state.selectedParty !== 'democrat') ? 'democrat' : null;
        this.onPartySelected(party);
      },
      r: () => {
        if (this.state.selectedYear >= 1956) {
          const party = (this.state.selectedParty !== 'republican') ? 'republican' : null;
          this.onPartySelected(party);
        }
      },
      w: () => {
        if (this.state.selectedYear <= 1954) {
          const party = (this.state.selectedParty !== 'whig') ? 'whig' : null;
          this.onPartySelected(party);
        }
      },
      a: this.onPartySelected,
      c: this.onViewSelected
    };

    if (!this.state.searching && commands[e.key]) {
      commands[e.key]();
    }
  }

  onDistrictUninspected () {
    this.setState({ inspectedDistrict: null });
  }

  onDistrictSelected (e) {
    let id = null;
    if (typeof e === 'number' || typeof e === 'string') {
      id = e;
    } else if (e.currentTarget && parseInt(e.currentTarget.id) !== this.state.selectedDistrict) {
      // use length to determine if it's a district id or a spatial id
      if (e.currentTarget.id.length === 12 || e.currentTarget.id.length === 14) {
        id = DistrictsStore.districtToSpatialId(e.currentTarget.id);
      } else {
        ({ id } = e.currentTarget);
      }
    } else if (e.id) {
      ({ id } = e.id);
    }
    if (id) {
      id = parseInt(id);
      AppActions.districtSelected(id);
    }

    if (this.state.searchOpen) {
      this.search.current.setEntryText('');
    }

    const newState = {
      selectedDistrict: id,
      selectedParty: null,
      onlyFlipped: false,
      searching: false,
      searchOptions: []
    };

    if (id) {
      // determine if the selected district is within the visible bounds
      const {
        mapScale,
        mapProjectionWidth,
        mapProjectionHeight,
        mapWidth,
        mapHeight
      } = DimensionsStore.getDimensions();
      const visibleBounds = this.calculateBounds(this.state.x, this.state.y, this.state.zoom);
      const rawDistrictBounds = (this.state.selectedView === 'map')
        ? DistrictsStore.getElectionDataForDistrict(id).bounds
        : DistrictsStore.getBoundsForDistrictAndBubble(id);
      const districtBounds = [
        [
          (rawDistrictBounds[0][0] * mapScale + mapProjectionWidth / 2) / mapProjectionWidth,
          (rawDistrictBounds[0][1] * mapScale + mapProjectionHeight / 2) / mapProjectionHeight
        ],
        [
          (rawDistrictBounds[1][0] * mapScale + mapProjectionWidth / 2) / mapProjectionWidth,
          (rawDistrictBounds[1][1] * mapScale + mapProjectionHeight / 2) / mapProjectionHeight
        ]
      ];

      if (districtBounds[0][0] < visibleBounds[0][0]
        || districtBounds[1][0] > visibleBounds[1][0]
        || districtBounds[0][1] < visibleBounds[0][1]
        || districtBounds[1][1] > visibleBounds[1][1]) {
        // calculate the highest zoom level that doesn't expand beyond the bounding box
        const maxHorizontal = (Math.max(districtBounds[1][0], visibleBounds[1][0]) -
          Math.min(districtBounds[0][0], visibleBounds[0][0])) * mapScale;
        let zHorizontal = 1;
        while (maxHorizontal * zHorizontal < mapWidth / 2) {
          zHorizontal *= 1.62;
        }
        const maxVertical = (Math.max(districtBounds[1][1], visibleBounds[1][1]) -
          Math.min(districtBounds[0][1], visibleBounds[0][1])) * mapScale;
        let zVertical = 1;
        while (maxVertical * zVertical < mapHeight / 2) {
          zVertical *= 1.62;
        }
        // set the zoom not to be below 1; if it is, reset the view entirely
        newState.zoom = Math.max(Math.round(Math.min(zHorizontal, zVertical) / 1.62 * 100) / 100, 1);
        if (newState.zoom === 1) {
          newState.x = 0.5;
          newState.y = 0.5;
        }
      }
    }

    this.setState(newState);
  }

  onZoomToDistrict (e) {
    const id = (typeof e === 'string') ? e : e.currentTarget.id;
    const xyz = (this.state.selectedView === 'map') ?
      DistrictsStore.getXYZForDistrict(id) :
      DistrictsStore.getXYXForDistrictAndBubble(id, this.state.selectedYear);

    this.setState({
      x: xyz.x,
      y: xyz.y,
      zoom: xyz.z
    });
  }

  onZoomInToPoint (e) {
    const dimensions = DimensionsStore.getDimensions();
    const x = e.nativeEvent.offsetX /
      (dimensions.mapProjectionWidth * this.state.zoom);
    const y = e.nativeEvent.offsetY /
      (dimensions.mapProjectionHeight * this.state.zoom);

    this.setState({
      x: x,
      y: y,
      zoom: Math.min(this.state.zoom * 1.62, 20)
    });
  }

  onMapDrag (x, y) {
    this.setState({
      x: x,
      y: y
    });
  }

  onModalClick (event) {
    const subject = (event.currentTarget.id) ? (event.currentTarget.id) : null;
    this.setState({
      textSubject: subject
    });
  }

  onSearching (e) {
    if (!this.state.searching) {
      this.setState({
        searching: true
      });
    }

    const waitInterval = 1000;
    clearTimeout(this.searchTimer);
    const searchingFor = this.search.current.refs.entry.value;
    this.searchTimer = setTimeout(() => {
      const searchOptions = DistrictsStore.getSearchData();
      const filteredOptions = this.search.current.getOptionsForValue(searchingFor, searchOptions);
      const filteredIds = filteredOptions.map(d => d.spatialId);

      this.setState({
        searchOptions: filteredIds
      });
    }, waitInterval);
  }

  onZoomIn () {
    this.setState({
      zoom: Math.min(this.state.zoom * 1.62, 20)
    });
  }

  zoomOut () {
    this.setState({
      zoom: Math.max(this.state.zoom / 1.62, 1)
    });
  }

  resetView () {
    this.setState({
      zoom: 1,
      x: 0.5,
      y: 0.5
    });
  }

  toggleFlipped (newState) {
    const theNewState = (typeof newState === 'boolean') ? newState : !this.state.onlyFlipped;
    this.setState({
      onlyFlipped: theNewState,
      selectedDistrict: null
    });
  }

  dimensionsChanged () {
    const halfWidth = DimensionsStore.getMapDimensions().width / 2;
    const halfHeight = DimensionsStore.getMapDimensions().height / 2;
    this.setState({
      x: halfWidth - (halfWidth - this.state.x) / this.state.zoom,
      y: halfHeight - (halfHeight - this.state.y) / this.state.zoom
    });
  }

  calculateBounds (x, y, zoom) {
    const {
      mapWidth,
      mapHeight,
      mapProjectionWidth,
      mapProjectionHeight
    } = DimensionsStore.getDimensions();
    const zoomedWidth = mapProjectionWidth * zoom;
    const zoomedHeight = mapProjectionHeight * zoom;
    const xWest = x - (mapWidth / 2) / zoomedWidth;
    const xEast = x + (mapWidth / 2) / zoomedWidth;
    const yNorth = y - (mapHeight / 2) / zoomedHeight;
    const ySouth = y + (mapHeight / 2) / zoomedHeight;
    return [[xWest, yNorth], [xEast, ySouth]];
  }

  storeChanged () { this.setState({}); }

  toggleDorling () {
    this.setState({ dorling: !this.state.dorling });
  }

  changeHash () {
    const vizState = {
      view: this.state.selectedView,
      year: this.state.selectedYear,
      district: this.state.selectedDistrict,
      party: this.state.selectedParty,
      xyz: [this.state.x, this.state.y, this.state.zoom]
        .map(d => Math.round(d * 1000) / 1000)
        .join('/')
    };

    HashManager.updateHash(vizState);
  }

  render () {
    const {
      selectedYear,
      selectedDistrict,
      textSubject
    } = this.state;
    const dimensions = DimensionsStore.getDimensions();
    const districtData = (selectedDistrict) ?
      DistrictsStore.getElectionDataForDistrict(selectedDistrict) : null;
    const spaceData = (selectedDistrict) ? DistrictsStore.getSpaceData() : null;

    if (districtData) {
      console.log(districtData.id);
    }

    return (
      <div>
        <Masthead
          dimensions={dimensions}
        />

        <Navigation
          dimensions={dimensions}
          onModalClick={this.onModalClick}
          onContactUsToggle={() => false}
        />

        { (this.state.searchOpen) &&
          <div
            id='search'
            style={dimensions.zoomControlsStyle}
          >
            <button
              onClick={this.onToggleSearch}
              className='close'
              style={{
                right: dimensions.nextPreviousButtonHeight / 2 - 1,
                top: dimensions.nextPreviousButtonHeight / 2 - 1
              }}
            >
              <svg
                width={dimensions.nextPreviousButtonHeight + 2}
                height={dimensions.nextPreviousButtonHeight + 2}
              >
                <g transform={`translate(${dimensions.nextPreviousButtonHeight / 2 + 1} ${dimensions.nextPreviousButtonHeight / 2 + 1}) rotate(135)`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={dimensions.nextPreviousButtonHeight / 2}
                    fill='silver'
                    stroke='#38444a'
                    strokeWidth={1}
                  />
                  <line
                    x1={0}
                    x2={0}
                    y1={dimensions.nextPreviousButtonHeight / 4}
                    y2={dimensions.nextPreviousButtonHeight / -4}
                    stroke='#233036'
                    strokeWidth={dimensions.nextPreviousButtonHeight / 10}
                  />
                  <line
                    x1={dimensions.nextPreviousButtonHeight / -4}
                    x2={dimensions.nextPreviousButtonHeight / 4}
                    y1={0}
                    y2={0}
                    stroke='#233036'
                    strokeWidth={dimensions.nextPreviousButtonHeight / 10}
                  />
                </g>
              </svg>
            </button>

            <Typeahead
              options={DistrictsStore.getSearchData(selectedYear)}
              placeholder={`search the election of ${this.state.selectedYear} by state, name, & party`}
              filterOption='searchText'
              displayOption='searchText'
              onOptionSelected={this.onDistrictSelected}
              onKeyDown={this.onSearching}
              customListComponent={SearchResult}
              onKeyUp={this.onSearching}
              //onBlur={ this.onSearchBlur }
              ref={this.search}
              //maxVisible={ 8 }
              inputProps={{
                style: {
                  fontSize: dimensions.electionLabelFontSize
                }
              }}
            />
          </div>
        }

        <TheMap
          uiState={this.state}
          onViewSelected={this.onViewSelected}
          onDistrictSelected={this.onDistrictSelected}
          onPartySelected={this.onPartySelected}
          onZoomIn={this.onZoomIn}
          onZoomInToPoint={this.onZoomInToPoint}
          onMapDrag={this.onMapDrag}
          resetView={this.resetView}
          zoomOut={this.zoomOut}
          toggleFlipped={this.toggleFlipped}
          hasThird={DistrictsStore.hasThird()}
          hasGTElection={DistrictsStore.hasGTElection()}
        />

        <Timeline
          steamgraphPaths={DistrictsStore.getSteamgraphPaths()}
          electionYears={DistrictsStore.getElectionYears()}
          maxDemocrats={DistrictsStore.getMaxTopOffset()}
          maxRepublicans={DistrictsStore.getMaxBottomOffset()}
          onYearSelected={this.onYearSelected}
          districtData={(spaceData && spaceData.length > 0) ? spaceData : false}
        />

        <TimelineHandle
          selectedYear={selectedYear}
          onYearSelected={this.onYearSelected}
          partyCounts={DistrictsStore.getPartyCounts()}
          showPartyCounts={!selectedDistrict}
          districtCircleY={(districtData && districtData.partyReg !== 'third') ? DimensionsStore.timelineDistrictYWithParty(districtData.percent, districtData.partyReg, DistrictsStore.getMaxBottomOffset()) : false}
          districtCircleFill={(districtData) ? getColorForParty(districtData.partyReg) : 'transparent'}
          nationalDomain={[DistrictsStore.getMaxTopOffset() * -1,
            DistrictsStore.getMaxBottomOffset()]}
          dimensions={dimensions}
          timelineXTermSpan={DimensionsStore.timelineXTermSpan()}
          timelineX={DimensionsStore.timelineX(selectedYear)}
        />

        <ElectionLabel
          selectedYear={selectedYear}
          previousYear={DistrictsStore.getPreviousElectionYear(selectedYear)}
          nextYear={DistrictsStore.getNextElectionYear(selectedYear)}
          onYearSelected={this.onYearSelected}
          onToggleSearch={this.onToggleSearch}
          dimensions={dimensions}
        />

        { (selectedDistrict && districtData) ?
          <DistrictData
            id={selectedDistrict}
            label={DistrictsStore.getDistrictLabel(selectedDistrict)}
            backgroundColor={getColorForParty(districtData.partyReg)}
            victor={formatPersonName(districtData.victor)}
            party={displayParty(districtData.party, districtData.partyReg)}
            percent={Math.round(districtData.percent * 1000) / 10}
            previousDistrict={DistrictsStore.getStatePreviousDistrictId(selectedDistrict)}
            nextDistrict={DistrictsStore.getStateNextDistrictId(selectedDistrict)}
            onDistrictSelected={this.onDistrictSelected}
            onZoomToDistrict={this.onZoomToDistrict}
            dimensions={dimensions}
          /> :
          <Context
            selectedYear={selectedYear}
            onPartySelected={this.onPartySelected}
            onlyFlipped={this.state.onlyFlipped}
            onDistrictSelected={this.onDistrictSelected}
            toggleView={this.toggleView}
            toggleFlipped={this.toggleFlipped}
            zoomToBounds={this.zoomToBounds}
            dimensions={dimensions}
          />
        }

        { (textSubject) &&
          <Text
            subject={textSubject}
            dimensions={dimensions}
            onModalClick={this.onModalClick}
          />
        }

      </div>
    );
  }
}

export default App;
