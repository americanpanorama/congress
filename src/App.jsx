// import node modules
import * as React from 'react';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import { getColorForParty, congressForYear, getStateName, ordinalSuffixOf } from './utils/HelperFunctions';

import TheMap from './components/MapContainer';
import Context from './components/Context';
import Timeline from './components/Timeline';
import TimelineHandle from './components/TimelineHandle';

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

  dimensionsChanged() {
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
      selectedParty = (e.currentTarget.id == this.state.selectedParty) ? null : e.currentTarget.id;
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
    newState = (typeof newState === 'boolean') ? newState : !this.state.onlyFlipped;
    this.setState({ onlyFlipped: newState }); 
  }

  onModalClick (event) {
    const subject = (event.currentTarget.id) ? (event.currentTarget.id) : null;
    AppActions.onModalClick(subject);
  }

  toggleDorling() { 
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
    if (this.state.inspectedDistrict) {
      let id = DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, this.state.inspectedDistrict).id;
      DistrictsStore.getPreviousAndNext3(this.state.selectedYear, id);
    }

    let viewableDistrict = this.state.inspectedDistrict || this.state.selectedDistrict,
      transitionDuration = (this.state.inspectedDistrict) ? 0 : 2000;

    return (
      <div>
        {/* masthead */}
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
          <nav>
            <h4 onClick={ this.onModalClick } id={ 'intro' }>Introduction</h4>
            <h4 onClick={ this.onModalClick } id={ 'sources' }>Sources & Method</h4>
            <h4 onClick={ this.onModalClick } id={ 'citing' }>Citing</h4>
            <h4 onClick={ this.onModalClick } id={ 'about' }>About</h4>
            <h4 onClick={ this.onContactUsToggle }>Contact Us</h4>
          </nav>
        </header>

        <TheMap
          selectedYear={this.state.selectedYear}
          onlyFlipped={this.state.onlyFlipped}
          viewableDistrict={this.state.inspectedDistrict || this.state.selectedDistrict}
          onDistrictInspected={this.onDistrictInspected}
          onDistrictUninspected={this.onDistrictUninspected}
          onDistrictSelected={this.onDistrictSelected}
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
            maxDemocrats={DistrictsStore.getMaxTopOffset()}
            maxRepublicans={DistrictsStore.getMaxBottomOffset()}
            congressYears={ DistrictsStore.getCongressYears() }
            onYearSelected={ this.onYearSelected }
            selectedYear={ this.state.selectedYear }
            partyCountForSelectedYear={ DistrictsStore.getRawPartyCounts(this.state.selectedYear) }
            districtData={ (viewableDistrict) ? DistrictsStore.getSpatialIdData(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).id) : false }
          />

        </aside>

        <aside
          id='handle'
          style={{ 
            width: DimensionsStore.getDimensions().timelineWidth,
            height: DimensionsStore.getDimensions().timelineHeight - DimensionsStore.getDimensions().timelineHorizontalGutter,
            bottom: DimensionsStore.getDimensions().gutterPadding,
            left: DimensionsStore.getDimensions().sidebarWidth + DimensionsStore.getDimensions().gutterPadding * 2,
            pointerEvents: 'none'
          }}
        >
          <TimelineHandle
            selectedYear={this.state.selectedYear}
            onYearSelected={this.onYearSelected}
            partyCounts={DistrictsStore.getRawPartyCounts()}
            nationalDomain={[DistrictsStore.getMaxTopOffset() * -1,
              DistrictsStore.getMaxBottomOffset()]}
          />
        </aside>

        <div
          id='electionLabel'
          style={{ 
            width: DimensionsStore.getDimensions().electionLabelWidth,
            height: DimensionsStore.getDimensions().electionLabelHeight,
            left: DimensionsStore.getDimensions().electionLabelLeft,
            bottom: DimensionsStore.getDimensions().electionLabelBottom,
          }}
        >
          <button
            onClick={ (DistrictsStore.getPreviousElectionYear(this.state.selectedYear)) ? this.onYearSelected : () => false }
            id={ DistrictsStore.getPreviousElectionYear(this.state.selectedYear) }
            style={{ 
              height: DimensionsStore.getDimensions().nextPreviousButtonHeight
            }}
          >
            <svg 
              width={DimensionsStore.getDimensions().nextPreviousButtonHeight} 
              height={DimensionsStore.getDimensions().nextPreviousButtonHeight}
            >
              <g transform={ 'translate(' + (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) + ' ' + (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) + ') rotate(315)' }>
                <circle
                  cx={0}
                  cy={0}
                  r={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) }
                  fill='silver'
                  fillOpacity={ (DistrictsStore.getPreviousElectionYear(this.state.selectedYear)) ? 1 : 0.7 }
                />
                <line
                  x1={ DimensionsStore.getDimensions().nextPreviousButtonHeight / -8 - 2 } 
                  x2={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 8 + 4) } 
                  y1={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  y2={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  stroke={ (DistrictsStore.getPreviousElectionYear(this.state.selectedYear)) ? '#233036' : '#73797C' }
                  strokeWidth={4}
                />
                <line
                  x1={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  x2={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  y1={ DimensionsStore.getDimensions().nextPreviousButtonHeight / -8 -2 } 
                  y2={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 8 + 4) } 
                  stroke={ (DistrictsStore.getPreviousElectionYear(this.state.selectedYear)) ? '#233036' : '#73797C' }
                  strokeWidth={4}
                />
              </g>
            </svg>
          </button>
          <h2 style={{ fontSize: DimensionsStore.getDimensions().electionLabelFontSize }}>Election of { this.state.selectedYear }: The { ordinalSuffixOf(congressForYear(this.state.selectedYear)) } Congress</h2>
          <button
            onClick={ (DistrictsStore.getNextElectionYear(this.state.selectedYear)) ? this.onYearSelected : () => false }
            id={ DistrictsStore.getNextElectionYear(this.state.selectedYear) }
            style={{ height: DimensionsStore.getDimensions().nextPreviousButtonHeight }}
          >
            <svg 
              width={DimensionsStore.getDimensions().nextPreviousButtonHeight} 
              height={DimensionsStore.getDimensions().nextPreviousButtonHeight}
            >
              <g transform={ 'translate(' + (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) + ' ' + (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) + ') rotate(135)' }>
                <circle
                  cx={0}
                  cy={0}
                  r={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) }
                  fill='silver'
                  fillOpacity={ (DistrictsStore.getNextElectionYear(this.state.selectedYear)) ? 1 : 0.7 }
                />
                <line
                  x1={ DimensionsStore.getDimensions().nextPreviousButtonHeight / -8 - 2 } 
                  x2={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 8 + 4) } 
                  y1={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  y2={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  stroke={ (DistrictsStore.getNextElectionYear(this.state.selectedYear)) ? '#233036' : '#73797C' }
                  strokeWidth={4}
                />
                <line
                  x1={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  x2={DimensionsStore.getDimensions().nextPreviousButtonHeight / -8}
                  y1={ DimensionsStore.getDimensions().nextPreviousButtonHeight / -8 -2 } 
                  y2={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 8 + 4) } 
                  stroke={ (DistrictsStore.getNextElectionYear(this.state.selectedYear)) ? '#233036' : '#73797C' }
                  strokeWidth={4}
                />
              </g>
            </svg>
          </button>
        </div>



        <aside 
          id='sidebar'
          style={{ 
            width: DimensionsStore.getDimensions().sidebarWidth,
            height: (viewableDistrict) ? DimensionsStore.getDimensions().sidebarHeight : DimensionsStore.getDimensions().sidebarHeight + DimensionsStore.getDimensions().districtLabelHeight,
            left: DimensionsStore.getDimensions().sidebarLeft,
            bottom: DimensionsStore.getDimensions().sidebarBottom,
          }}
        >
          { (viewableDistrict) ?
            <div>
              <div>Victor: { DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).victor }</div>
              { (DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).regularized_party_of_victory == 'third') ?
                <div>Party: { DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).party_of_victory }</div> : ''
              }

            </div> : 
            <Context 
              selectedYear={ this.state.selectedYear }
              onPartySelected={ this.onPartySelected }
              onlyFlipped={ this.state.onlyFlipped }
              toggleView={ this.toggleView }
              toggleFlipped={ this.toggleFlipped }
              zoomToBounds={ this.zoomToBounds }
            />
          }
        </aside>

        <div 
          id='districtLabel'
          style={{ 
            width: DimensionsStore.getDimensions().districtLabelWidth,
            height: DimensionsStore.getDimensions().districtLabelHeight,
            left: DimensionsStore.getDimensions().districtLabelLeft,
            bottom: DimensionsStore.getDimensions().districtLabelBottom,
            backgroundColor: (!viewableDistrict) ? '#38444a' : getColorForParty(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).regularized_party_of_victory)
          }}
        >
          { (viewableDistrict) ? 
            <div>
              <h2 style={{ fontSize: DimensionsStore.getDimensions().electionLabelFontSize }}>
                { getStateName(DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).state) + ' ' + DistrictsStore.getElectionDataForDistrict(this.state.selectedYear, viewableDistrict).district }
              </h2>
              { (viewableDistrict == this.state.selectedDistrict) ?
                <button
                  onClick={ this.onDistrictSelected }
                >
                  <svg 
                    width={DimensionsStore.getDimensions().nextPreviousButtonHeight + 2} 
                    height={DimensionsStore.getDimensions().nextPreviousButtonHeight + DimensionsStore.getDimensions().nextPreviousButtonYOffset + 2}
                  >
                    <g transform={ 'translate(' + (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) + ' ' + (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2 + DimensionsStore.getDimensions().nextPreviousButtonYOffset) + ') rotate(135)' }>
                      <circle
                        cx={0}
                        cy={0}
                        r={ (DimensionsStore.getDimensions().nextPreviousButtonHeight / 2) }
                        fill='silver'
                        stroke='#38444a'
                        strokeWidth={1}
                      />
                      <line
                        x1={ 0} 
                        x2={ 0 } 
                        y1={DimensionsStore.getDimensions().nextPreviousButtonHeight / 4}
                        y2={DimensionsStore.getDimensions().nextPreviousButtonHeight / -4}
                        stroke='#233036'
                        strokeWidth={4}
                      />
                      <line
                        x1={DimensionsStore.getDimensions().nextPreviousButtonHeight / -4}
                        x2={DimensionsStore.getDimensions().nextPreviousButtonHeight / 4}
                        y1={ 0 } 
                        y2={ 0 } 
                        stroke='#233036'
                        strokeWidth={4}
                      />
                    </g>
                  </svg>
                </button> : ''
              }
            </div> : ''
          }
        </div>

        { (TextStore.mainModalIsOpen()) ?
          <div 
            className='longishform'
            style={{
              top: DimensionsStore.getDimensions().textTop,
              bottom: DimensionsStore.getDimensions().textBottom,
              left: DimensionsStore.getDimensions().textLeft,
              width: DimensionsStore.getDimensions().textWidth
            }}
          >
            <button 
              className='close' 
              onClick={ this.onModalClick }
              style={{
                top: DimensionsStore.getDimensions().textCloseTop,
                right: DimensionsStore.getDimensions().textCloseRight,
              }}
            >
              <span>close</span>
            </button>
            <div className='content' dangerouslySetInnerHTML={ TextStore.getModalContent() } />
          </div> :
          null
        }

      </div>
    );
  }

}

export default App;