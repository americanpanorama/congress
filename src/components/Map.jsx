import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Draggable from 'react-draggable';
import ToggleButton from 'react-toggle-button';
import DimensionsStore from '../stores/DimensionsStore';
import DistrictsStore from '../stores/Districts';
import HashManager from '../stores/HashManager';
import Bubble from './Bubble';
import District from './District';
import MapLegend from './MapLegend';
import ZoomControls from './ZoomControls';

import { getColorForParty, getColorForMargin, yearForCongress, congressForYear, getStateName, ordinalSuffixOf } from '../utils/HelperFunctions';

export default class Map extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      //districts: DistrictsStore.getElectionDistricts(this.props.selectedYear)
    };

    // bind handlers
    const handlers = ['changeHash', 'onViewSelected', 'toggleView', 'onZoomIn', 'zoomOut', 'zoom', 'resetView', 'handleMouseUp'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  static getDerivedStateFromProps (props) {
    const theHash = HashManager.getState();
    const [x, y, z] = (theHash.xyz) ? theHash.xyz.split('/').map(d => parseFloat(d)) : [0.5, 0.5, 1];

    return {
      selectedView: theHash.view || 'cartogram',
      dorling: theHash.view !== 'map',
      winnerView: theHash.show === 'winner',
      districts: DistrictsStore.getElectionDistricts(props.selectedYear),
      states: DistrictsStore.getStates(props.selectedYear),
      cityBubbles: DistrictsStore.getBubbleCoords(props.selectedYear).cities,
      districtBubbles: DistrictsStore.getBubbleCoords(props.selectedYear).districts,
      zoom: z,
      x: x,
      y: y,
      deltaX: 0,
      deltaY: 0,
      // offsetX: x,
      // offsetY: y,
      offsetX: (DimensionsStore.getDimensions().mapWidth * z * x - DimensionsStore.getDimensions().mapWidth / 2) * -1,
      offsetY: (DimensionsStore.getDimensions().mapHeight * z * y - DimensionsStore.getDimensions().mapHeight / 2) * -1,
      draggableX: 0,
      draggableY: 0
    };
  }

  componentDidUpdate () { this.changeHash(); }

  onViewSelected (e) {
    const selectedView = (this.state.selectedView === 'map') ? 'cartogram' : 'map';
    this.setState({
      selectedView: selectedView,
      dorling: (selectedView === 'map') ? false : (selectedView === 'cartogram') ? true : this.state.dorling,
    });
  }

  toggleView (e) { this.setState({ winnerView: !this.state.winnerView }); }

  onZoomIn () {
    this.zoom(1.62, [DimensionsStore.getDimensions().mapWidth / 2,
      DimensionsStore.getDimensions().mapHeight / 2]);
  }

  zoomOut () {
    this.zoom(1 / 1.62, [DimensionsStore.getDimensions().mapWidth / 2,
      DimensionsStore.getDimensions().mapHeight / 2]);
  }

  zoom (zMultipier, point) {
    const z = Math.min(this.state.zoom * zMultipier, 18);

    const vpWidth = DimensionsStore.getDimensions().mapWidth;
    const currentWidth = vpWidth * this.state.zoom;
    const newWidth = vpWidth * z;
    const propOffsetX = (this.state.x * -1 + point[0]) / currentWidth;
    const newOffsetX = (newWidth * this.state.x - point[0]) * -1;

    const vpHeight = DimensionsStore.getDimensions().mapHeight;
    const currentHeight = vpHeight * this.state.zoom;
    const newHeight = vpHeight * z;
    const propOffsetY = (this.state.y * -1 + point[1]) / currentHeight;
    const newOffsetY = (newHeight * this.state.y - point[1]) * -1;

    this.setState({
      zoom: z,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
      draggableX: 0,
      draggableY: 0
    });
  }

  resetView () {
    this.setState({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      x: 0,
      y: 0,
      draggableX: 0,
      draggableY: 0
    });
  }

  handleMouseUp (e, ui) {
    // this.setState({
    //   x: this.state.offsetX + ui.x,
    //   y: this.state.offsetY + ui.y,
    //   draggableX: ui.x,
    //   draggableY: ui.y
    // });
    const vpWidth = DimensionsStore.getDimensions().mapWidth;
    const currentWidth = vpWidth * this.state.zoom;
    const propOffsetX = ((this.state.offsetX + ui.x) * -1 + vpWidth / 2) / currentWidth;
    const vpHeight = DimensionsStore.getDimensions().mapHeight;
    const currentHeight = vpHeight * this.state.zoom;
    const propOffsetY = ((this.state.offsetY + ui.y) * -1 + vpHeight / 2) / currentHeight;
    
    this.setState({
      x: propOffsetX,
      y: propOffsetY,
      draggableX: ui.x,
      draggableY: ui.y
    });
  }

  changeHash () {
    const vizState = {
      view: this.state.selectedView,
      xyz: [this.state.x, this.state.y, this.state.zoom]
        .map(d => Math.round(d * 1000) / 1000)
        .join('/'),
      show: (this.state.winnerView) ? 'winner' : 'strength'
    };

    HashManager.updateHash(vizState);
  }

  render () {
    return (
      <React.Fragment>
        <div
          style={{
            width: DimensionsStore.getDimensions().mapWidth,
            height: DimensionsStore.getDimensions().mapHeight
          }}
          className='theMap'
        >
          <div
            style={{
              width: DimensionsStore.getDimensions().mapWidth * this.state.zoom,
              height: DimensionsStore.getDimensions().mapHeight * this.state.zoom,
              transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
            }}
          >
            <Draggable
              position={{ x: this.state.draggableX, y: this.state.draggableY }}
              onStop={this.handleMouseUp}
            >
              <svg
                width={DimensionsStore.getDimensions().mapWidth * this.state.zoom}
                height={DimensionsStore.getDimensions().mapHeight * this.state.zoom}
              >
                <filter id='glow' x='-50%' y='-10%' width='200%' height='160%'>
                  <feGaussianBlur stdDeviation='10' result='glow' />
                </filter>

                <filter id='blur' x='-50%' y='-10%' width='200%' height='160%'>
                  <feGaussianBlur stdDeviation='5' result='blur' />
                </filter>
                <g
                  //transform={`translate(${DimensionsStore.getDimensions().mapWidth * this.state.zoom / 2} ${DimensionsStore.getDimensions().mapHeight * this.state.zoom / 2})`}
                >
                  <g
                    // onDoubleClick={ this.onZoomIn }
                    // onMouseUp={this.handleMouseUp }
                    // onMouseDown={this.handleMouseDown }
                    // onMouseMove={this.handleMouseMove }
                    transform={`scale(${this.state.zoom})`}
                  >

                    {/* district polygons */}
                    { this.state.districts.map((d) => {
                      let fillOpacity = 1;
                      if (this.props.selectedParty && this.props.selectedParty !== d.regularized_party_of_victory) {
                        fillOpacity = 0.05;
                      } else if ((this.state.selectedView === 'cartogram' && this.props.viewableDistrict !== d.id) || (this.props.viewableDistrict && this.props.viewableDistrict !== d.id) || (this.props.onlyFlipped && !d.flipped)) {
                        fillOpacity = 0.1;
                      }

                      let strokeOpacity = 1;
                      if (this.state.selectedView =='cartogram' && (!this.props.viewableDistrict || this.props.viewableDistrict !== d.id)) {
                        strokeOpacity = 0;
                      } else if (this.props.viewableDistrict && this.props.viewableDistrict !== d.id) {
                        strokeOpacity = 0.2;
                      }

                      return (
                        <District
                          d={DistrictsStore.getPath(d.the_geojson)}
                          key={`polygon${d.id}`}
                          fill={(this.state.winnerView || this.state.selectedView === 'cartogram') ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote)}
                          fillOpacity={fillOpacity}
                          stroke='#eee'
                          strokeWidth={(!this.props.viewableDistrict || this.props.viewableDistrict !== d.id) ? 0.5 : 2}
                          strokeOpacity={strokeOpacity}
                          selectedView={this.state.selectedView}
                          onDistrictInspected={this.props.onDistrictInspected}
                          onDistrictUninspected={this.props.onDistrictUninspected}
                          onDistrictSelected={this.props.onDistrictSelected}
                          id={d.id}
                          duration={2000}
                          pointerEvents={(this.state.selectedView === 'map') ? 'auto' : 'none'}
                        />
                      );
                    })}

                    { this.state.states.map(s => (
                      <path
                        d={DistrictsStore.getPath(s.geometry)}
                        fill='transparent'
                        stroke='#eee'
                        strokeOpacity={(this.state.selectedView ==='cartogram') ? 0.2 : 1}
                        strokeWidth={(!this.props.viewableDistrict || s.properties.abbr_name === DistrictsStore.getElectionDataForDistrict(this.props.selectedYear, this.props.viewableDistrict).state) ? 1.5 : 0.3}
                        key={`stateBoundaries${s.properties.name}`}
                        filter={(this.state.selectedView === 'cartogram') ? 'url(#blur)' : ''}
                        style={{ pointerEvents: 'none' }}
                      />
                    ))}

                    {/* city bubbles */}
                    { this.state.cityBubbles.map((d, i) => (
                      <Bubble
                        cx={(this.state.dorling) ? d.x : d.xOrigin}
                        cy={(this.state.dorling) ? d.y : d.yOrigin}
                        r={(this.state.dorling) ? d.r : 0.01}
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
                        cx={(this.state.dorling) ? d.x : d.xOrigin}
                        cy={(this.state.dorling) ? d.y : d.yOrigin}
                        r={DimensionsStore.getDimensions().districtR}
                        color={(this.state.selectedView === 'map') ? 'transparent' : (this.state.winnerView) ? getColorForParty(d.regularized_party_of_victory) : getColorForMargin(d.regularized_party_of_victory, d.percent_vote)}
                        stroke={(this.state.selectedView === 'map' || (this.props.selectedParty && this.props.selectedParty !== d.regularized_party_of_victory)) ? 'transparent' : (this.state.selectedView === 'cartogram' && this.props.viewableDistrict && this.props.viewableDistrict == d.districtId) ? 'white' : getColorForParty(d.regularized_party_of_victory) }
                        fillOpacity={((this.props.selectedParty && this.props.selectedParty !== d.regularized_party_of_victory) || (this.props.onlyFlipped && !d.flipped)) ? 0.05 : (this.props.viewableDistrict && this.props.viewableDistrict !== d.districtId) ? 0.3 : 1}
                        label={ (d.flipped && ((!this.props.selectedParty || this.props.selectedParty === d.regularized_party_of_victory) && (!this.props.selectedDistrict || d.districtId === this.props.selectedDistrict))) ? 'F' : ''}
                        labelColor={getColorForParty(d.regularized_party_of_victory)}
                        key={d.id}
                        id={d.districtId}
                        pointerEvents={(this.state.selectedView == 'map') ? 'none' : 'auto'}
                        selectedView={this.state.selectedView}
                        onDistrictInspected={this.props.onDistrictInspected}
                        onDistrictUninspected={this.props.onDistrictUninspected}
                        onDistrictSelected={this.props.onDistrictSelected}
                      />
                    ))} 

                  </g>
                </g>
              </svg>
            </Draggable>
          </div>
        </div>

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

        <MapLegend
          selectedView={this.state.selectedView}
          selectedYear={this.props.selectedYear}
          selectedParty={this.state.selectedParty}
          onPartySelected={this.props.onPartySelected}
          winnerView={this.state.winnerView}
          onlyFlipped={this.props.onlyFlipped}
          toggleFlipped={this.props.toggleFlipped}
        />

        <ZoomControls
          onZoomIn={this.onZoomIn}
          onZoomOut={this.zoomOut}
          resetView={this.resetView}
          currentZoom={this.state.zoom}
          dimensions={DimensionsStore.getDimensions()}
        />

      </React.Fragment>
    );
  }
}

Map.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  selectedParty: PropTypes.string,
  onlyFlipped: PropTypes.bool.isRequired,
  viewableDistrict: PropTypes.string,
  onDistrictInspected: PropTypes.func.isRequired,
  onDistrictUninspected: PropTypes.func.isRequired,
  onDistrictSelected: PropTypes.func.isRequired
};

Map.defaultProps = {
  viewableDistrict: '',
  selectedParty: ''
};
