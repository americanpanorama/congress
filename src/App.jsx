import * as React from 'react';

import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import { getColorForParty } from './utils/HelperFunctions';

import TheMap from './components/MapContainer';
import Context from './components/Context';
import Timeline from './components/Timeline';
import TimelineHandle from './components/TimelineHandle';
import ElectionLabel from './components/ElectionLabel';
import DistrictData from './components/DistrictData';

import DistrictsStore from './stores/Districts';
import DimensionsStore from './stores/DimensionsStore';
import TextStore from './stores/Text';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {
  constructor (props) {
    super(props);

    // initialize state
    const theHash = HashManager.getState();
    const [x, y, z] = (theHash.xyz) ? theHash.xyz.split('/') : [0, 0, 1];
    this.state = {
      selectedYear: parseInt(theHash.year, 10) || 1952,
      selectedDistrict: theHash.district || null,
      selectedParty: null,
      onlyFlipped: false,
      inspectedDistrict: null,
      dorling: theHash.view !== 'map',
      zoom: z,
      x: x,
      y: y
    };

    // bind handlers
    const handlers = ['onWindowResize', 'onYearSelected', 'toggleDorling', 'storeChanged', 'onDistrictInspected', 'onDistrictUninspected', 'onDistrictSelected', 'onPartySelected', 'toggleFlipped', 'dimensionsChanged', 'onModalClick'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () {
    AppActions.loadInitialData(this.state, HashManager.getState());
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    DistrictsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    TextStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.dimensionsChanged);
  }

  componentDidUpdate () { this.changeHash(); }

  storeChanged () { this.setState({}); }

  dimensionsChanged () {
    this.setState({
      x: DimensionsStore.getMapDimensions().width / 2 - (DimensionsStore.getMapDimensions().width / 2 - this.state.x) / this.state.zoom,
      y: DimensionsStore.getMapDimensions().height / 2 - (DimensionsStore.getMapDimensions().height / 2 - this.state.y) / this.state.zoom
    });
  }

  onWindowResize () { AppActions.windowResized(); }

  onYearSelected (e) {
    const year = parseInt((e.currentTarget) ? e.currentTarget.id : e, 10);
    AppActions.congressSelected(year);
    this.setState({
      inspectedDistrict: null
    });
    // don't set state until the districts have been loaded
    const loading = setInterval(() => {
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

  onPartySelected (e) {
    let selectedParty;
    if (e && e.currentTarget) {
      selectedParty = (e.currentTarget.id === this.state.selectedParty) ? null : e.currentTarget.id;
    } else {
      selectedParty = e;
    }

    this.setState({ selectedParty: selectedParty });
  }

  onDistrictInspected (e) {
    //this.setState({ inspectedDistrict: e.target.id });
  }

  onDistrictUninspected () {
    this.setState({ inspectedDistrict: null });
  }

  onDistrictSelected (e) {
    const id = (e.currentTarget.id !== this.state.selectedDistrict) ? e.currentTarget.id : null;
    this.setState({ selectedDistrict: id });
  }

  toggleFlipped (newState) {
    const theNewState = (typeof newState === 'boolean') ? newState : !this.state.onlyFlipped;
    this.setState({ onlyFlipped: theNewState });
  }

  onModalClick (event) {
    const subject = (event.currentTarget.id) ? (event.currentTarget.id) : null;
    AppActions.onModalClick(subject);
  }

  toggleDorling () {
    this.setState({ dorling: !this.state.dorling });
  }

  changeHash () {
    const vizState = {
      year: this.state.selectedYear,
      district: this.state.selectedDistrict
    };

    HashManager.updateHash(vizState);
  }

  render () {
    const viewableDistrict = this.state.inspectedDistrict || this.state.selectedDistrict;
    const dimensions = DimensionsStore.getDimensions();

    return (
      <div>
        {/* masthead */}
        <header
          style={{
            height: dimensions.headerHeight,
            width: dimensions.mapWidth,
            margin: dimensions.gutterPadding
          }}
        >
          <h1
            style={{
              fontSize: dimensions.headerTitleFontSize,
              marginTop: dimensions.headerGutter
            }}
          >
            American Democracy's Landscape
          </h1>
          <h2
            style={{
              fontSize: dimensions.headerSubtitleFontSize,
              marginTop: dimensions.headerGutter
            }}
          >
            Electing the House of Representatives
          </h2>
          <nav>
            <h4 onClick={this.onModalClick} id={'intro'}>Introduction</h4>
            <h4 onClick={this.onModalClick} id={'sources'}>Sources & Method</h4>
            <h4 onClick={this.onModalClick} id={'citing'}>Citing</h4>
            <h4 onClick={this.onModalClick} id={'about'}>About</h4>
            <h4 onClick={this.onContactUsToggle}>Contact Us</h4>
          </nav>
        </header>

        <TheMap
          selectedYear={this.state.selectedYear}
          onlyFlipped={this.state.onlyFlipped}
          selectedParty={this.state.selectedParty}
          viewableDistrict={this.state.inspectedDistrict || this.state.selectedDistrict}
          onDistrictInspected={this.onDistrictInspected}
          onDistrictUninspected={this.onDistrictUninspected}
          onDistrictSelected={this.onDistrictSelected}
          onPartySelected={this.onPartySelected}
          toggleFlipped={this.toggleFlipped}
          hasThird={DistrictsStore.getPartyCountForYearAndParty(this.state.selectedYear, 'third') > 0}
        />

        <Timeline
          partyCount={DistrictsStore.getPartyCounts()}
          partyCountKeys={DistrictsStore.getPartyCountsKeys()}
          maxDemocrats={DistrictsStore.getMaxTopOffset()}
          maxRepublicans={DistrictsStore.getMaxBottomOffset()}
          congressYears={DistrictsStore.getCongressYears()}
          onYearSelected={this.onYearSelected}
          selectedYear={this.state.selectedYear}
          partyCountForSelectedYear={DistrictsStore.getRawPartyCounts(this.state.selectedYear)}
          districtData={(viewableDistrict) ? DistrictsStore.getSpatialIdData(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).id) : false}
        />

        <TimelineHandle
          selectedYear={this.state.selectedYear}
          onYearSelected={this.onYearSelected}
          partyCounts={DistrictsStore.getRawPartyCounts()}
          nationalDomain={[DistrictsStore.getMaxTopOffset() * -1,
            DistrictsStore.getMaxBottomOffset()]}
          dimensions={dimensions}
          timelineXTermSpan={DimensionsStore.timelineXTermSpan()}
          timelineX={DimensionsStore.timelineX(this.state.selectedYear)}
        />

        <ElectionLabel
          selectedYear={this.state.selectedYear}
          previousYear={DistrictsStore.getPreviousElectionYear(this.state.selectedYear)}
          nextYear={DistrictsStore.getNextElectionYear(this.state.selectedYear)}
          onYearSelected={this.onYearSelected}
          dimensions={dimensions}
        />

        { (viewableDistrict) ?
          <DistrictData
            label={DistrictsStore.getDistrictLabel(this.state.selectedYear, viewableDistrict)}
            isSelected={viewableDistrict === this.state.selectedDistrict}
            backgroundColor={(!viewableDistrict) ? '#38444a' : getColorForParty(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).regularized_party_of_victory)}
            victor={DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).victor}
            party={(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).regularized_party_of_victory === 'third') ? DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).party_of_victory : ''}
            onDistrictSelected={this.onDistrictSelected}
            dimensions={dimensions}
          /> :
          <Context
            selectedYear={this.state.selectedYear}
            onPartySelected={this.onPartySelected}
            onlyFlipped={this.state.onlyFlipped}
            toggleView={this.toggleView}
            toggleFlipped={this.toggleFlipped}
            zoomToBounds={this.zoomToBounds}
            dimensions={dimensions}
          />
        }

        { (TextStore.mainModalIsOpen()) ?
          <div
            className='longishform'
            style={{
              top: dimensions.textTop,
              bottom: dimensions.textBottom,
              left: dimensions.textLeft,
              width: dimensions.textWidth
            }}
          >
            <button
              className='close'
              onClick={this.onModalClick}
              style={{
                top: dimensions.textCloseTop,
                right: dimensions.textCloseRight,
              }}
            >
              <span>close</span>
            </button>
            <div className='content' dangerouslySetInnerHTML={TextStore.getModalContent()} />
          </div> :
          null
        }

      </div>
    );
  }
}

export default App;