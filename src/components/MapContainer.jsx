import * as React from 'react';
import PropTypes from 'prop-types';

import TheMap from './Map';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import ZoomControls from './ZoomControls';

import DimensionsStore from '../stores/DimensionsStore';
import DistrictStore from '../stores/Districts';
import HashManager from '../stores/HashManager';

export default class MapContainer extends React.Component {
  constructor (props) {
    super(props);

    const theHash = HashManager.getState();

    this.state = {
      selectedView: theHash.view || 'cartogram',
      winnerView: !theHash.show || theHash.show === 'winner',
      geolocation: null,
      geolocating: false
    };

    // bind handlers
    const handlers = ['changeHash', 'onViewSelected', 'toggleView', 'zoom', 'onDistrictInspected', 'geolocate', 'selectCurrentLocation'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  componentDidUpdate () { this.changeHash(); }

  onViewSelected (e) {
    const selectedView = (this.state.selectedView === 'map') ? 'cartogram' : 'map';
    this.setState({
      selectedView: selectedView
    });
  }

  onDistrictInspected (e) {
    if (!this.state.isDragging) {
      this.props.onDistrictInspected(e);
    }
  }

  zoom (zMultipier, point) {
    const z = Math.min(this.state.zoom * zMultipier, 20);
    const newWidth = DimensionsStore.getDimensions().mapWidth * z;
    const newOffsetX = (newWidth * this.state.x - point[0]) * -1;
    const newHeight = DimensionsStore.getDimensions().mapHeight * z;
    const newOffsetY = (newHeight * this.state.y - point[1]) * -1;

    this.setState({
      zoom: z,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  }

  toggleView (e) {
    this.setState({ winnerView: !this.state.winnerView });
  }

  geolocate () {
    this.setState({
      geolocating: true
    });
    // try to retrieve the users location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          geolocation: [position.coords.longitude, position.coords.latitude],
          geolocating: false
        }, this.selectCurrentLocation);
      }, (error) => {
        console.warn('Geolocation error occurred. Error code: ' + error.code);
      });
    }
  }

  selectCurrentLocation () {
    if (this.state.geolocation) {
      const districtId = DistrictStore.findDistrict(this.state.geolocation, this.props.selectedYear);
      if (districtId) {
        this.props.onDistrictSelected(districtId);
      }
    } else {
      this.geolocate();
    }
  }

  changeHash () {
    const vizState = {
      view: this.state.selectedView,
      show: (this.state.winnerView) ? 'winner' : 'strength'
    };

    HashManager.updateHash(vizState);
  }

  render () {
    const dimensions = DimensionsStore.getDimensions();

    return (
      <React.Fragment>
        <TheMap
          selectedView={this.state.selectedView}
          winnerView={this.state.winnerView}
          selectedYear={this.props.selectedYear}
          selectedParty={this.props.selectedParty}
          geolocation={(this.state.geolocation) ? DistrictStore.projectPoint(this.state.geolocation) : null}
          onlyFlipped={this.props.onlyFlipped}
          viewableDistrict={this.props.viewableDistrict}
          onDistrictInspected={this.props.onDistrictInspected}
          onDistrictUninspected={this.props.onDistrictUninspected}
          onDistrictSelected={this.props.onDistrictSelected}
          onMapDrag={this.props.onMapDrag}
          x={this.props.x}
          y={this.props.y}
          zoom={this.props.zoom}
        />

        <MapControls
          selectedView={this.state.selectedView}
          winnerView={this.state.winnerView}
          onViewSelected={this.onViewSelected}
          toggleView={this.toggleView}
        />

        <MapLegend
          selectedView={this.state.selectedView}
          selectedYear={this.props.selectedYear}
          selectedParty={this.props.selectedParty}
          onPartySelected={this.props.onPartySelected}
          winnerView={this.state.winnerView}
          onlyFlipped={this.props.onlyFlipped}
          toggleFlipped={this.props.toggleFlipped}
          hasThird={this.props.hasThird}
        />

        <ZoomControls
          onZoomIn={this.props.onZoomIn}
          onZoomOut={this.props.zoomOut}
          resetView={this.props.resetView}
          selectCurrentLocation={this.selectCurrentLocation}
          currentZoom={this.props.zoom}
          resetable={this.props.zoom !== 1 || this.props.x !== 0.5 || this.props.y !== 0.5}
          geolocating={this.state.geolocating}
          dimensions={dimensions}
        />

      </React.Fragment>
    );
  }
}

MapContainer.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  selectedParty: PropTypes.string,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  onlyFlipped: PropTypes.bool.isRequired,
  viewableDistrict: PropTypes.string,
  onDistrictInspected: PropTypes.func.isRequired,
  onDistrictUninspected: PropTypes.func.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  onPartySelected: PropTypes.func.isRequired,
  toggleFlipped: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  zoomOut: PropTypes.func.isRequired,
  onMapDrag: PropTypes.func.isRequired,
  resetView: PropTypes.func.isRequired,
  hasThird: PropTypes.bool.isRequired
};

MapContainer.defaultProps = {
  viewableDistrict: '',
  selectedParty: ''
};
