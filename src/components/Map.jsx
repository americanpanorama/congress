import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

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

    const dimensions = DimensionsStore.getDimensions();
    const { zoom, x, y } = props.uiState;

    this.state = {
      draggableX: 0,
      draggableY: 0,
      transitionDuration: 1000,
      offsetX: (dimensions.mapProjectionWidth * zoom * x - dimensions.mapWidth / 2) * -1,
      offsetY: (dimensions.mapProjectionHeight * zoom * y - dimensions.mapHeight / 2) * -1,
      width: dimensions.mapProjectionWidth * zoom,
      height: dimensions.mapProjectionHeight * zoom,
      zoom: zoom
    };

    this.map = React.createRef();
    this.container = React.createRef();
    this.mapElements = React.createRef();

    // bind handlers
    const handlers = ['handleMouseUp', 'onDistrictSelected'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  static getDerivedStateFromProps (props, state) {
    const newState = {};
    const { selectedYear } = props.uiState;

    // obviously update state if new year or if districts haven't yet loaded
    if (!state.lastUiState || state.districts.length === 0
      || state.districtBubbles.length === 0
      || selectedYear !== state.lastUiState.selectedYear) {
      newState.districts = DistrictsStore.getElectionDistricts();
      newState.gtElections = DistrictsStore.getGeneralTicketElections();
      newState.states = DistrictsStore.getStates();
      newState.cityBubbles = DistrictsStore.getCityBubbles();
      newState.districtBubbles = DistrictsStore.getElectionBubbles();
    }

    if (Object.keys(newState).length > 0) {
      newState.lastUiState = props.uiState;
      return newState;
    }

    return null;
  }

  componentDidUpdate (prevProps, prevState) {
    const { zoom, x, y } = this.props.uiState;
    if (x !== prevProps.uiState.x || y !== prevProps.uiState.y || zoom !== prevProps.uiState.zoom) {
      const dimensions = DimensionsStore.getDimensions();
      const newState = {
        offsetX: (dimensions.mapProjectionWidth * zoom * x - dimensions.mapWidth / 2) * -1,
        offsetY: (dimensions.mapProjectionHeight * zoom * y - dimensions.mapHeight / 2) * -1,
        width: dimensions.mapProjectionWidth * zoom,
        height: dimensions.mapProjectionHeight * zoom,
        zoom: zoom
      };

      d3.select(this.container.current)
        .transition()
        .duration(1000)
        .style('width', `${newState.width}px`)
        .style('height', `${newState.height}px`)
        .style('transform', `translate3d(${newState.offsetX}px, ${newState.offsetY}px, 0)`)
        .on('end', () => { this.setState(newState); });

      d3.select(this.map.current)
        .transition()
        .duration(1000)
        .attr('width', newState.width)
        .attr('height', newState.height);

      d3.select(this.mapElements.current)
        .transition()
        .duration(1000)
        .attr('transform', `scale(${newState.zoom})`);
    }
  }

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
    const offsetX = Math.round((dimensions.mapProjectionWidth * this.state.zoom * propOffsetX -
        dimensions.mapWidth / 2) * -1 * 1000) / 1000;
    const vpHeight = dimensions.mapHeight;
    const currentHeight = dimensions.mapProjectionHeight * this.props.uiState.zoom;
    const propOffsetY = (vpHeight / 2 - this.state.offsetY - ui.y) / currentHeight;
    const offsetY = Math.round((dimensions.mapProjectionHeight * this.state.zoom * propOffsetY -
      dimensions.mapHeight / 2) * -1 * 1000) / 1000;

    // calculate whether the map was moved
    const wasDrug = propOffsetX !== this.props.uiState.x || propOffsetY !== this.props.uiState.y;

    // update the map immediately
    this.setState({
      wasDrug: wasDrug,
      offsetX: offsetX,
      offsetY: offsetY
    }, () => this.props.onMapDrag(propOffsetX, propOffsetY));
  }

  render () {
    const dimensions = DimensionsStore.getDimensions();
    const mapScale = DimensionsStore.getMapScale();
    const {
      uiState,
      onZoomInToPoint,
      geolocation
    } = this.props;

    const {
      selectedView,
      selectedParty,
      selectedDistrict,
      zoom
    } = uiState;

    const transformation = `translate(${dimensions.mapProjectionWidth / 2} ${dimensions.mapProjectionHeight / 2}) scale(${mapScale})`;

    const dataForDistrict = (selectedDistrict) ?
      DistrictsStore.getElectionDataForDistrict(selectedDistrict) : undefined;

    const selectedState = (dataForDistrict) ?
      this.state.states.find(s => s.state === dataForDistrict.state) : undefined;

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
            width: this.state.width,
            height: this.state.height,
            transform: `translate3d(${this.state.offsetX}px, ${this.state.offsetY}px, 0)`
          }}
          ref={this.container}
        >
          <Draggable
            position={{ x: this.state.draggableX, y: this.state.draggableY }}
            onStop={this.handleMouseUp}
          >
            <div>
              <svg
                width={this.state.width}
                height={this.state.height}
                onDoubleClick={onZoomInToPoint}
                ref={this.map}
              >
                <filter id='glow' x='-50%' y='-10%' width='200%' height='160%'>
                  <feGaussianBlur stdDeviation='10' result='glow' />
                </filter>

                <filter id='blur' x='-50%' y='-10%' width='200%' height='160%'>
                  <feGaussianBlur stdDeviation='5' result='blur' />
                </filter>
                <g
                  transform={`scale(${this.state.zoom})`}
                  ref={this.mapElements}
                >

                  {/* district polygons */}
                  <g transform={transformation}>
                    {/* line connecting district and bubble if district is selected on cartogram */}
                    { (dataForDistrict && selectedView === 'cartogram') &&
                      <line
                        x1={dataForDistrict.x}
                        y1={dataForDistrict.y}
                        x2={dataForDistrict.xOrigin}
                        y2={dataForDistrict.yOrigin}
                        stroke='white'
                        strokeWidth={1 / mapScale}
                      />
                    }

                    { this.state.districts.map(d => (
                      <District
                        d={d.svg}
                        id={d.spatialId}
                        onDistrictSelected={this.onDistrictSelected}
                        duration={(selectedView === 'map') ? this.state.transitionDuration : 0}
                        {...getDistrictStyleFromUi(d, uiState)}
                        key={`polygon${d.id}`}
                      />
                    ))}

                    {/* states */}
                    { this.state.states.map(s => (
                      <path
                        d={s.svg}
                        key={`stateBoundaries${s.state}`}
                        filter={(selectedView === 'cartogram') ? 'url(#blur)' : ''}
                        style={getStateStyle(s, uiState)}
                      />
                    ))}

                    {/* selected district && state on top */}
                    { (dataForDistrict) &&
                      <District
                        d={dataForDistrict.svg}
                        id={dataForDistrict.spatialId}
                        onDistrictSelected={this.onDistrictSelected}
                        duration={(selectedView === 'map') ? this.state.transitionDuration : 0}
                        {...getDistrictStyleFromUi(dataForDistrict, uiState)}
                        key={`selectedDistrict${dataForDistrict.spatialId}`}
                      />
                    }

                    { (selectedState) &&
                      <path
                        d={selectedState.svg}
                        filter={(selectedView === 'cartogram') ? 'url(#blur)' : ''}
                        style={getStateStyle(selectedState, uiState)}
                      />
                    }

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
                        label={(d.flipped && ((!selectedParty || selectedParty === d.partyReg) && (!selectedDistrict || d.districtId === selectedDistrict))) ? 'F' : ''}
                        labelColor={getColorForParty(d.partyReg)}
                        duration={this.state.transitionDuration}
                        id={d.spatialId}
                        onDistrictSelected={this.onDistrictSelected}
                        {...getBubbleStyle(d, uiState)}
                        key={`bubble-${d.spatialId}`}
                      />
                    ))}

                    { (selectedView === 'map') &&
                      <React.Fragment>
                        { this.state.gtElections.map(state => (
                          <StateGeneralTicket
                            key={state.state}
                            {...state}
                            d={state.elections[0].svg}
                            length={dimensions.districtR * 1.5}
                            onDistrictSelected={this.onDistrictSelected}
                            uiState={uiState}
                          />
                        ))}
                      </React.Fragment>
                    }
                  </g>

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
            </div>
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
    selectedDistrict: PropTypes.number,
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
