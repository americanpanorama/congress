import * as React from 'react';
import PropTypes from 'prop-types';

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

  static getDerivedStateFromProps (props) {
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
      draggableY: 0
    };
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
                  let fillOpacity = 1;
                  if (selectedParty && selectedParty !== d.regularized_party_of_victory) {
                    fillOpacity = 0.05;
                  } else if ((selectedView === 'cartogram' && viewableDistrict !== d.id) || (viewableDistrict && viewableDistrict !== d.id) || (onlyFlipped && !d.flipped)) {
                    fillOpacity = 0.1;
                  }

                  let strokeOpacity = 1;
                  if (selectedView === 'cartogram' && (!viewableDistrict || viewableDistrict !== d.id)) {
                    strokeOpacity = 0;
                  } else if (viewableDistrict && viewableDistrict !== d.id) {
                    strokeOpacity = 0.2;
                  }

                  return (
                    <District
                      d={DistrictsStore.getPath(d.the_geojson)}
                      key={`polygon${d.id}`}
                      fill={(winnerView || selectedView === 'cartogram') ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote)}
                      fillOpacity={fillOpacity}
                      stroke='#eee'
                      strokeWidth={(!viewableDistrict || viewableDistrict !== d.id) ? 0.5 : 2}
                      strokeOpacity={strokeOpacity}
                      selectedView={selectedView}
                      onDistrictInspected={this.onDistrictInspected}
                      onDistrictUninspected={onDistrictUninspected}
                      onDistrictSelected={onDistrictSelected}
                      id={d.id}
                      duration={2000}
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
                { this.state.cityBubbles.map((d, i) => (
                  <Bubble
                    cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                    cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                    r={(selectedView === 'cartogram') ? d.r : 0.01}
                    cityLabel={d.id} 
                    color='#11181b'
                    fillOpacity={0.5}
                    stroke='transparent'
                    key={d.id || 'missing' + i}
                    id={d.id}
                  />
                ))}

                {/* district bubbles */}
                { this.state.districtBubbles.map(d => (
                  <Bubble
                    cx={(selectedView === 'cartogram') ? d.x : d.xOrigin}
                    cy={(selectedView === 'cartogram') ? d.y : d.yOrigin}
                    r={dimensions.districtR}
                    color={(selectedView === 'map') ? 'transparent' : (winnerView) ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote)}
                    stroke={(selectedView === 'map' || (selectedParty && selectedParty !== d.regularized_party_of_victory)) ? 'transparent' : (selectedView === 'cartogram' && viewableDistrict && viewableDistrict == d.districtId) ? 'white' : getColorForParty(d.regularized_party_of_victory) }
                    fillOpacity={((selectedParty && selectedParty !== d.regularized_party_of_victory) || (onlyFlipped && !d.flipped)) ? 0.05 : (viewableDistrict && viewableDistrict !== d.districtId) ? 0.3 : 1}
                    label={ (d.flipped && ((!selectedParty || selectedParty === d.regularized_party_of_victory) && (!viewableDistrict || d.districtId === viewableDistrict))) ? 'F' : ''}
                    labelColor={getColorForParty(d.regularized_party_of_victory)}
                    key={d.id}
                    id={d.districtId}
                    pointerEvents={(selectedView === 'map') ? 'none' : 'auto'}
                    selectedView={selectedView}
                    onDistrictInspected={this.onDistrictInspected}
                    onDistrictUninspected={onDistrictUninspected}
                    onDistrictSelected={onDistrictSelected}
                  />
                ))} 

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
