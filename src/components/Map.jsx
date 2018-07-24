import * as React from 'react';
import PropTypes from 'prop-types';

import Draggable from 'react-draggable';

import Bubble from './Bubble';
import BubbleCity from './BubbleCity';
import District from './District';

import DimensionsStore from '../stores/DimensionsStore';
import DistrictsStore from '../stores/Districts';

import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

export default class Map extends React.Component {
  constructor (props) {
    super(props);

    this.state = {};

    // bind handlers
    const handlers = ['handleMouseUp', 'handleMouseDown', 'onDistrictSelected'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  static getDerivedStateFromProps (props, prevState) {
    let transitionDuration = 1000;
    // no transition on party selected
    if (props.selectedParty !== prevState.lastSelectedParty ||
      props.onlyFlipped !== prevState.lastFlipped) {
      transitionDuration = 0;
    } else if (props.viewableDistrict !== prevState.lastViewableDistrict) {
      // no transition on selection of district
      transitionDuration = 0;
    }

    const dimensions = DimensionsStore.getDimensions();

    return {
      districts: DistrictsStore.getElectionDistricts(props.selectedYear),
      states: DistrictsStore.getStates(props.selectedYear),
      cityBubbles: DistrictsStore.getBubbleCoords(props.selectedYear).cities,
      districtBubbles: DistrictsStore.getBubbleCoords(props.selectedYear).districts,
      offsetX: (dimensions.mapProjectionWidth * props.zoom * props.x -
        dimensions.mapWidth / 2) * -1,
      offsetY: (dimensions.mapProjectionHeight * props.zoom * props.y -
        dimensions.mapHeight / 2) * -1,
      draggableX: 0,
      draggableY: 0,
      transitionDuration: transitionDuration,
      lastSelectedParty: props.selectedParty,
      lastFlipped: props.onlyFlipped,
      lastViewableDistrict: props.viewableDistrict
    };
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (this.state.districts.length === 0 ||
      this.state.districtBubbles.length === 0 ||
      this.state.cityBubbles.length === 0 ||
      this.props.onlyFlipped !== nextProps.onlyFlipped ||
      this.props.selectedParty !== nextProps.selectedParty ||
      this.props.selectedView !== nextProps.selectedView ||
      this.props.selectedYear !== nextProps.selectedYear ||
      this.props.viewableDistrict !== nextProps.viewableDistrict ||
      this.props.winnerView !== nextProps.winnerView ||
      this.props.x !== nextProps.x ||
      this.props.y !== nextProps.y ||
      this.props.zoom !== nextProps.zoom ||
      this.props.geolocation !== nextProps.geolocation);
  }

  onDistrictSelected (e) {
    if (!this.state.wasDrug) {
      this.props.onDistrictSelected(e);
    }
  }

  handleMouseDown () {
    this.setState({ isDragging: true });
  }

  handleMouseUp (e, ui) {
    const vpWidth = DimensionsStore.getDimensions().mapWidth;
    const currentWidth = DimensionsStore.getDimensions().mapProjectionWidth * this.props.zoom;
    const propOffsetX = (vpWidth / 2 - this.state.offsetX - ui.x) / currentWidth;
    const vpHeight = DimensionsStore.getDimensions().mapHeight;
    const currentHeight = DimensionsStore.getDimensions().mapProjectionHeight * this.props.zoom;
    const propOffsetY = (vpHeight / 2 - this.state.offsetY - ui.y) / currentHeight;

    // calculate whether the map was moved
    const wasDrug = propOffsetX !== this.props.x || propOffsetY !== this.props.y;

    this.props.onMapDrag(propOffsetX, propOffsetY);

    this.setState({
      isDragging: false,
      wasDrug: wasDrug
    });
  }

  render () {
    const dimensions = DimensionsStore.getDimensions();
    const {
      selectedYear,
      selectedView,
      winnerView,
      selectedParty,
      viewableDistrict,
      onlyFlipped,
      onDistrictUninspected,
      onZoomInToPoint,
      zoom,
      geolocation
    } = this.props;

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
            onDrag={this.handleMouseDown}
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
                // onDoubleClick={ this.onZoomIn }
                // onMouseUp={this.handleMouseUp }
                // onMouseDown={this.handleMouseDown }
                // onMouseMove={this.handleMouseMove }
                transform={`scale(${zoom})`}
              >

                {/* district polygons */}
                { this.state.districts.map((d) => {
                  const color = (winnerView || (selectedView === 'cartogram' && viewableDistrict !== d.id)) ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote);

                  let fillOpacity = (selectedView === 'map') ? 1 : 0.1;
                  let strokeOpacity = (selectedView === 'map') ? 1 : 0;
                  // hide if not among selected party or selected flipped
                  if ((selectedParty && selectedParty !== d.regularized_party_of_victory) ||
                   (onlyFlipped && !d.flipped)) {
                    fillOpacity = 0;
                    strokeOpacity = 0;
                  }
                  // obscure if not selected district
                  if (viewableDistrict) {
                    if (viewableDistrict === d.id) {
                      fillOpacity = 1;
                      strokeOpacity = 1;
                    } else {
                      fillOpacity = 0.1;
                      strokeOpacity = (selectedView === 'map') ? 1 : 0;
                    }
                  }

                  return (
                    <District
                      d={DistrictsStore.getPath(d.the_geojson)}
                      key={`polygon${d.id}`}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke='#eee'
                      strokeWidth={(!viewableDistrict || viewableDistrict !== d.id) ? 0.5 / zoom : 2 / zoom}
                      strokeOpacity={strokeOpacity}
                      selectedView={selectedView}
                      onDistrictSelected={this.onDistrictSelected}
                      id={d.id}
                      duration={this.state.transitionDuration}
                      pointerEvents={(selectedView === 'map') ? 'auto' : 'none'}
                    />
                  );
                })}

                { this.state.states.map(s => (
                  <path
                    d={DistrictsStore.getPath(s.geometry)}
                    fill='transparent'
                    stroke='#eee'
                    strokeOpacity={(selectedView === 'cartogram') ? 0.2 : 1}
                    strokeWidth={(!viewableDistrict || s.properties.abbr_name === DistrictsStore.getElectionDataForDistrict(this.props.selectedYear, viewableDistrict).state) ? 1.5 / zoom : 0.3 / zoom}
                    key={`stateBoundaries${s.properties.name}`}
                    filter={(selectedView === 'cartogram') ? 'url(#blur)' : ''}
                    style={{ pointerEvents: 'none' }}
                  />
                ))}

                {/* city bubbles */}
                { this.state.cityBubbles.map((d, i) => {
                  let fillOpacity = 0.5;
                  let cityLabelOpacity = 1;

                  if (selectedView === 'map') {
                    cityLabelOpacity = 0;
                  } else {
                    if (selectedParty) {
                      const percentOfParty = DistrictsStore.cityPercentForParty(d.id, selectedYear, selectedParty);
                      cityLabelOpacity = percentOfParty;
                      //fillOpacity = 0.1 + percentOfParty * 0.4;
                      if (percentOfParty === 0) {
                        fillOpacity = 0.2;
                      }
                    }

                    if (onlyFlipped) {
                      const flippedPercent = DistrictsStore.cityFlippedPercent(d.id, selectedYear);
                      //cityLabelOpacity = flippedPercent;
                      if (flippedPercent === 0) {
                        fillOpacity = 0.2;
                        cityLabelOpacity = 0.2
                      }
                    }

                    if (viewableDistrict && !DistrictsStore.districtInCity(DistrictsStore.getBubbleForDistrict(viewableDistrict, selectedYear), d)) {
                      fillOpacity = 0.2;
                      cityLabelOpacity = 0.2;
                    }
                  }

                  return (
                    <BubbleCity
                      cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                      cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                      r={(selectedView === 'cartogram') ? d.r : 0.01}
                      fillOpacity={fillOpacity}
                      cityLabel={d.id}
                      cityLabelOpacity={cityLabelOpacity}
                      key={d.id}
                      duration={this.state.transitionDuration}
                    />
                  );
                })}

                {/* district bubbles */}
                { this.state.districtBubbles.map((d) => {
                  let color;
                  let stroke;
                  let fillOpacity = (selectedView === 'cartogram') ? 1 : 0;
                  if (selectedView === 'map') {
                    color = 'transparent';
                    stroke = 'transparent';
                  } else if (winnerView) {
                    color = getColorForParty(d.regularized_party_of_victory);
                    stroke = getColorForParty(d.regularized_party_of_victory);
                  } else {
                    color = getColorForMargin(d.regularized_party_of_victory, d.percent_vote);
                    stroke = getColorForMargin(d.regularized_party_of_victory, d.percent_vote);
                  }

                  // change stroke of selected district to white
                  if (selectedView === 'cartogram' && viewableDistrict && viewableDistrict === d.districtId) {
                    stroke = 'white';
                  }
                  // (selectedView === 'map' || (selectedParty && selectedParty !== d.regularized_party_of_victory)) ? 'transparent' : (selectedView === 'cartogram' && viewableDistrict && viewableDistrict == d.districtId) ? 'white' 
                  
                  // hide if not among selected party or selected flipped
                  if ((selectedParty && selectedParty !== d.regularized_party_of_victory) ||
                   (onlyFlipped && !d.flipped)) {
                    fillOpacity = 0.1;
                  }
                  // obscure if not selected district
                  if (viewableDistrict && viewableDistrict !== d.districtId) {
                    fillOpacity = 0.1;
                  }

                  return (
                    <Bubble
                      cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                      cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                      r={dimensions.districtR}
                      color={color}
                      stroke={stroke}
                      fillOpacity={fillOpacity}
                      label={(d.flipped && ((!selectedParty || selectedParty === d.regularized_party_of_victory) && (!viewableDistrict || d.districtId === viewableDistrict))) ? 'F' : ''}
                      labelColor={getColorForParty(d.regularized_party_of_victory)}
                      key={d.id}
                      id={d.districtId}
                      pointerEvents={(selectedView === 'map') ? 'none' : 'auto'}
                      onDistrictSelected={this.onDistrictSelected}
                      duration={this.state.transitionDuration}
                    />
                  );
                })}

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
                        attributeName="r" 
                        begin="0s" 
                        dur="4s" 
                        repeatCount="indefinite" 
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
                        attributeName="r" 
                        begin="0s" 
                        dur="4s" 
                        repeatCount="indefinite" 
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
  selectedView: PropTypes.string.isRequired,
  winnerView: PropTypes.bool.isRequired,
  selectedYear: PropTypes.number.isRequired,
  selectedParty: PropTypes.string,
  geolocation: PropTypes.array,
  onlyFlipped: PropTypes.bool.isRequired,
  viewableDistrict: PropTypes.string,
  onDistrictInspected: PropTypes.func.isRequired,
  onDistrictUninspected: PropTypes.func.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  onMapDrag: PropTypes.func.isRequired,
  onZoomInToPoint: PropTypes.func.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired
};

Map.defaultProps = {
  viewableDistrict: '',
  selectedParty: '',
  geolocation: null
};
