import * as React from 'react';
import PropTypes from 'prop-types';

import Draggable from 'react-draggable';

import Bubble from './Bubble';
import BubbleCity from './BubbleCity';
import District from './District';
import StateGeneralTicket from './StateGeneralTicket';

import DimensionsStore from '../stores/DimensionsStore';
import DistrictsStore from '../stores/Districts';

import { getDistrictStyleFromUi, getCityBubbleStyle, getCityBubbleLabelOpacity, getBubbleStyle, getStateStyle, getColorForParty } from '../utils/HelperFunctions';

export default class Map extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      draggableX: 0,
      draggableY: 0,
      transitionDuration: 1000
    };

    // bind handlers
    const handlers = ['handleMouseUp', 'onDistrictSelected'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  static getDerivedStateFromProps (props, state) {
    const newState = {};

    const {
      selectedYear,
      zoom,
      x,
      y
    } = props.uiState;

    // obviously update state if new year or if districts haven't yet loaded
    if (!state.lastUiState || state.districts.length === 0
      || selectedYear !== state.lastUiState.selectedYear) {
      const bubbleCoords = DistrictsStore.getBubbleCoords(selectedYear);
      newState.districts = DistrictsStore.getElectionDistricts(selectedYear);
      newState.gtElections = DistrictsStore.getGeneralTicketElections(selectedYear);
      newState.states = DistrictsStore.getStates(selectedYear);
      newState.cityBubbles = bubbleCoords.cities;
      newState.districtBubbles = bubbleCoords.districts;
    }

    // update if xyz view is different, e.g. zoomed to district
    if (!state.lastUiState
      || x !== state.lastUiState.x
      || y !== state.lastUiState.y
      || zoom !== state.lastUiState.zoom) {
      const dimensions = DimensionsStore.getDimensions();
      newState.offsetX = (dimensions.mapProjectionWidth * zoom * x -
        dimensions.mapWidth / 2) * -1;
      newState.offsetY = (dimensions.mapProjectionHeight * zoom * y -
        dimensions.mapHeight / 2) * -1;
    }

    if (Object.keys(newState).length > 0) {
      newState.lastUiState = props.uiState;
      return newState;
    }

    return null;
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   return (this.state.districts.length === 0 ||
  //     this.state.districtBubbles.length === 0 ||
  //     this.state.cityBubbles.length === 0 ||
  //     this.props.uiState.onlyFlipped !== nextProps.uiState.onlyFlipped ||
  //     this.props.uiState.selectedParty !== nextProps.uiState.selectedParty ||
  //     this.props.uiState.selectedView !== nextProps.uiState.selectedView ||
  //     this.props.uiState.selectedYear !== nextProps.uiState.selectedYear ||
  //     this.props.uiState.selectedDistrict !== nextProps.uiState.selectedDistrict ||
  //     this.props.uiState.winnerView !== nextProps.uiState.winnerView ||
  //     this.props.uiState.x !== nextProps.uiState.x ||
  //     this.props.uiState.y !== nextProps.uiState.y ||
  //     this.props.uiState.zoom !== nextProps.uiState.zoom ||
  //     this.props.geolocation !== nextProps.geolocation);
  // }

  onDistrictSelected (e) {
    if (!this.state.wasDrug) {
      this.props.onDistrictSelected(e);
    }
  }

  handleMouseUp (e, ui) {
    const dimensions = DimensionsStore.getDimensions();
    const vpWidth = dimensions.mapWidth;
    const currentWidth = dimensions.mapProjectionWidth * this.props.uiState.zoom;
    const propOffsetX = (vpWidth / 2 - this.state.offsetX - ui.x) / currentWidth;
    const vpHeight = dimensions.mapHeight;
    const currentHeight = dimensions.mapProjectionHeight * this.props.uiState.zoom;
    const propOffsetY = (vpHeight / 2 - this.state.offsetY - ui.y) / currentHeight;

    // calculate whether the map was moved
    const wasDrug = propOffsetX !== this.props.uiState.x || propOffsetY !== this.props.uiState.y;

    this.props.onMapDrag(propOffsetX, propOffsetY);

    this.setState({
      wasDrug: wasDrug
    });
  }

  render () {
    const dimensions = DimensionsStore.getDimensions();
    const {
      uiState,
      onZoomInToPoint,
      geolocation
    } = this.props;

    const {
      selectedYear,
      selectedView,
      selectedParty,
      selectedDistrict,
      zoom
    } = uiState;

    return (
      <div
        style={{
          width: dimensions.mapWidth,
          height: dimensions.mapHeight
        }}
        className='theMap'
      >
        <div
          style={{
            width: dimensions.mapProjectionWidth * zoom,
            height: dimensions.mapProjectionHeight * zoom,
            transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
          }}
        >
          <Draggable
            position={{ x: this.state.draggableX, y: this.state.draggableY }}
            onStop={this.handleMouseUp}
          >
            <svg
              width={dimensions.mapProjectionWidth * zoom}
              height={dimensions.mapProjectionHeight * zoom}
              onDoubleClick={onZoomInToPoint}
            >
              <filter id='glow' x='-50%' y='-10%' width='200%' height='160%'>
                <feGaussianBlur stdDeviation='10' result='glow' />
              </filter>

              <filter id='blur' x='-50%' y='-10%' width='200%' height='160%'>
                <feGaussianBlur stdDeviation='5' result='blur' />
              </filter>
              <g
                transform={`scale(${zoom})`}
              >

                {/* line connecting district and bubble if district is selected on cartogram */}
                { (selectedDistrict && selectedView === 'cartogram') &&
                  <line
                    x1={DistrictsStore.getBubbleForDistrict(selectedDistrict, selectedYear).x}
                    y1={DistrictsStore.getBubbleForDistrict(selectedDistrict, selectedYear).y}
                    x2={DistrictsStore.getDistrictCentroid(selectedDistrict)[0]}
                    y2={DistrictsStore.getDistrictCentroid(selectedDistrict)[1]}
                    stroke='white'
                  />
                }

                {/* district polygons */}
                { this.state.districts.map(d => (
                  <District
                    d={d.d}
                    id={d.id}
                    onDistrictSelected={this.onDistrictSelected}
                    duration={(selectedView === 'map') ? this.state.transitionDuration : 0}
                    {...getDistrictStyleFromUi(d, uiState)}
                    key={`polygon${d.id}`}
                  />
                ))}

                {/* states */}
                { this.state.states.map(s => (
                  <path
                    d={s.properties.d}
                    key={`stateBoundaries${s.properties.statename}`}
                    filter={(selectedView === 'cartogram') ? 'url(#blur)' : ''}
                    style={getStateStyle(s, uiState)}
                  />
                ))}

                {/* city bubbles */}
                { this.state.cityBubbles.map((d, i) => (
                  <BubbleCity
                    cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                    cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                    r={(selectedView === 'cartogram') ? d.r : dimensions.districtR}
                    cityLabel={d.id}
                    cityLabelOpacity={getCityBubbleLabelOpacity(d, uiState)}
                    duration={this.state.transitionDuration}
                    {...getCityBubbleStyle(d, uiState)}
                    key={d.id}
                  />
                ))}

                {/* district bubbles */}
                { this.state.districtBubbles.map(d => (
                  <Bubble
                    cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                    cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                    r={dimensions.districtR}
                    label={(d.flipped && ((!selectedParty || selectedParty === d.regularized_party_of_victory) && (!selectedDistrict || d.districtId === selectedDistrict))) ? 'F' : ''}
                    labelColor={getColorForParty(d.regularized_party_of_victory)}
                    duration={this.state.transitionDuration}
                    id={d.districtId}
                    onDistrictSelected={this.onDistrictSelected}
                    {...getBubbleStyle(d, uiState)}
                    key={d.id}
                  />
                ))}

                { (selectedView === 'map') &&
                  <React.Fragment>
                    { this.state.gtElections.map(state => (
                      <StateGeneralTicket
                        key={state.state}
                        {...state}
                        d={DistrictsStore.getPath(state.the_geojson)}
                        length={dimensions.districtR * 1.5}
                        onDistrictSelected={this.onDistrictSelected}
                        uiState={uiState}
                      />
                    ))}
                  </React.Fragment>
                }

                { (geolocation) &&
                  <g
                    transform={`translate(${geolocation[0]} ${geolocation[1]}) rotate(45)`}
                    style={{
                      pointerEvents: 'none'
                    }}
                  >
                    <circle
                      cx={0}
                      cy={0}
                      r={20 / zoom}
                      fill='silver'
                      fillOpacity={0.2}
                      stroke='green'
                      strokeWidth={0.5 / zoom}
                    />
                    <circle
                      cx={0}
                      cy={0}
                      r={8 / zoom}
                      fill='silver'
                      fillOpacity={0.75}
                    >
                      <animate
                        attributeName='r'
                        begin='0s'
                        dur='4s'
                        repeatCount='indefinite'
                        values={`${8 / zoom};${3 / zoom};${8 / zoom}`}
                      />
                    </circle>
                    <circle
                      cx={0}
                      cy={0}
                      r={6 / zoom}
                      fill='green'
                    >
                      <animate
                        attributeName='r'
                        begin='0s'
                        dur='4s'
                        repeatCount='indefinite'
                        values={`${6 / zoom};${1 / zoom};${6 / zoom}`}
                      />
                    </circle>
                  </g>
                }

              </g>
            </svg>
          </Draggable>
        </div>
      </div>
    );
  }
}

Map.propTypes = {
  uiState: PropTypes.shape({
    selectedView: PropTypes.string.isRequired,
    winnerView: PropTypes.bool.isRequired,
    selectedYear: PropTypes.number.isRequired,
    selectedParty: PropTypes.string,
    onlyFlipped: PropTypes.bool,
    selectedDistrict: PropTypes.string,
    zoom: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    searchOptions: PropTypes.array
  }).isRequired,
  geolocation: PropTypes.array,
  onDistrictSelected: PropTypes.func.isRequired,
  onMapDrag: PropTypes.func.isRequired,
  onZoomInToPoint: PropTypes.func.isRequired
};

Map.defaultProps = {
  geolocation: null
};
