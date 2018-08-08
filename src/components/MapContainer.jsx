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
      winnerView: !theHash.show || theHash.show === 'winner',
      geolocation: null,
      geolocating: false
    };

    // bind handlers
    const handlers = ['changeHash', 'toggleView', 'geolocate', 'selectCurrentLocation'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });
  }

  componentDidUpdate () { this.changeHash(); }

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
        console.warn(`Geolocation error occurred. Error code: ${error.code}`);
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
      show: (this.state.winnerView) ? 'winner' : 'strength'
    };

    HashManager.updateHash(vizState);
  }

  render () {
    const dimensions = DimensionsStore.getDimensions();
    const geolocation = (this.state.geolocation) ?
      DistrictStore.projectPoint(this.state.geolocation) : null;
    const {
      selectedView,
      selectedYear,
      selectedParty,
      onlyFlipped,
      viewableDistrict,
      onDistrictSelected,
      onMapDrag,
      onZoomIn,
      zoomOut,
      resetView,
      onZoomInToPoint,
      onViewSelected,
      onPartySelected,
      toggleFlipped,
      hasThird,
      x,
      y,
      zoom
    } = this.props;

    return (
      <React.Fragment>
        <TheMap
          selectedView={selectedView}
          winnerView={this.state.winnerView}
          selectedYear={selectedYear}
          selectedParty={selectedParty}
          geolocation={geolocation}
          onlyFlipped={onlyFlipped}
          viewableDistrict={viewableDistrict}
          onDistrictSelected={onDistrictSelected}
          onMapDrag={onMapDrag}
          onZoomInToPoint={onZoomInToPoint}
          x={x}
          y={y}
          zoom={zoom}
        />

        <MapControls
          selectedView={selectedView}
          winnerView={this.state.winnerView}
          onViewSelected={onViewSelected}
          toggleView={this.toggleView}
        />

        <MapLegend
          selectedView={selectedView}
          selectedYear={selectedYear}
          selectedParty={selectedParty}
          onPartySelected={onPartySelected}
          winnerView={this.state.winnerView}
          onlyFlipped={onlyFlipped}
          toggleFlipped={toggleFlipped}
          hasThird={hasThird}
        />

        <ZoomControls
          onZoomIn={onZoomIn}
          onZoomOut={zoomOut}
          resetView={resetView}
          selectCurrentLocation={this.selectCurrentLocation}
          currentZoom={zoom}
          resetable={zoom !== 1 || x !== 0.5 || y !== 0.5}
          geolocating={this.state.geolocating}
          dimensions={dimensions}
        />

      </React.Fragment>
    );
  }
}

MapContainer.propTypes = {
  selectedView: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  selectedParty: PropTypes.string,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  onlyFlipped: PropTypes.bool.isRequired,
  viewableDistrict: PropTypes.string,
  onDistrictSelected: PropTypes.func.isRequired,
  onPartySelected: PropTypes.func.isRequired,
  onZoomInToPoint: PropTypes.func.isRequired,
  onViewSelected: PropTypes.func.isRequired,
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
