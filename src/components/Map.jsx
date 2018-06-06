import * as React from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';

import Draggable from 'react-draggable';

import Bubble from './Bubble';
import District from './District';

import DimensionsStore from '../stores/DimensionsStore';
import DistrictsStore from '../stores/Districts';

import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

export default class Map extends React.Component {
  constructor (props) {
    super(props);

    this.state = {};

    // bind handlers
    const handlers = ['handleMouseUp', 'handleMouseDown', 'onDistrictInspected'];
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

    return {
      districts: DistrictsStore.getElectionDistricts(props.selectedYear),
      states: DistrictsStore.getStates(props.selectedYear),
      cityBubbles: DistrictsStore.getBubbleCoords(props.selectedYear).cities,
      districtBubbles: DistrictsStore.getBubbleCoords(props.selectedYear).districts,
      offsetX: (DimensionsStore.getDimensions().mapWidth * props.zoom * props.x -
        DimensionsStore.getDimensions().mapWidth / 2) * -1,
      offsetY: (DimensionsStore.getDimensions().mapHeight * props.zoom * props.y -
        DimensionsStore.getDimensions().mapHeight / 2) * -1,
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
      this.props.zoom !== nextProps.zoom);
  }

  onDistrictInspected (e) {
    if (!this.state.isDragging) {
      this.props.onDistrictInspected(e);
    }
  }

  handleMouseDown () {
    this.setState({ isDragging: true });
  }

  handleMouseUp (e, ui) {
    const vpWidth = DimensionsStore.getDimensions().mapWidth;
    const currentWidth = vpWidth * this.props.zoom;
    const propOffsetX = ((this.state.offsetX + ui.x) * -1 + vpWidth / 2) / currentWidth;
    const vpHeight = DimensionsStore.getDimensions().mapHeight;
    const currentHeight = vpHeight * this.props.zoom;
    const propOffsetY = ((this.state.offsetY + ui.y) * -1 + vpHeight / 2) / currentHeight;

    this.props.onMapDrag(propOffsetX, propOffsetY);

    this.setState({ isDragging: false });
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
      onDistrictSelected,
      zoom
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
            width: dimensions.mapWidth * zoom,
            height: dimensions.mapHeight * zoom,
            transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
          }}
        >
          <Draggable
            position={{ x: this.state.draggableX, y: this.state.draggableY }}
            onDrag={this.handleMouseDown}
            onStop={this.handleMouseUp}
          >
            <svg
              width={dimensions.mapWidth * zoom}
              height={dimensions.mapHeight * zoom}
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
                      strokeWidth={(!viewableDistrict || viewableDistrict !== d.id) ? 0.5 : 2}
                      strokeOpacity={strokeOpacity}
                      selectedView={selectedView}
                      onDistrictInspected={this.onDistrictInspected}
                      onDistrictUninspected={onDistrictUninspected}
                      onDistrictSelected={onDistrictSelected}
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
                    strokeWidth={(!viewableDistrict || s.properties.abbr_name === DistrictsStore.getElectionDataForDistrict(this.props.selectedYear, viewableDistrict).state) ? 1.5 : 0.3}
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
                    <Bubble
                      cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                      cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                      r={(selectedView === 'cartogram') ? d.r : 0.01}
                      cityLabel={d.id}
                      cityLabelOpacity={cityLabelOpacity}
                      color='#11181b'
                      fillOpacity={fillOpacity}
                      stroke='transparent'
                      key={d.id}
                      id={d.id}
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
                      selectedView={selectedView}
                      onDistrictInspected={this.onDistrictInspected}
                      onDistrictUninspected={onDistrictUninspected}
                      onDistrictSelected={onDistrictSelected}
                      duration={this.state.transitionDuration}
                    />
                  );
                })}
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
  onlyFlipped: PropTypes.bool.isRequired,
  viewableDistrict: PropTypes.string,
  onDistrictInspected: PropTypes.func.isRequired,
  onDistrictUninspected: PropTypes.func.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  onMapDrag: PropTypes.func.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired
};

Map.defaultProps = {
  viewableDistrict: '',
  selectedParty: ''
};
