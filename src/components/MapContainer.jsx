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
    const [x, y, z] = (theHash.xyz) ? theHash.xyz.split('/').map(d => parseFloat(d)) : [0.5, 0.5, 1];

    this.state = {
      selectedView: theHash.view || 'cartogram',
      winnerView: !theHash.show || theHash.show === 'winner',
      zoom: z,
      x: x,
      y: y,
      geolocation: null,
      geolocating: false
    };

    // bind handlers
    const handlers = ['changeHash', 'onViewSelected', 'toggleView', 'onZoomIn', 'zoomOut', 'zoom', 'resetView', 'onDistrictInspected', 'onMapDrag', 'geolocate', 'selectCurrentLocation'];
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

  onZoomIn () {
    this.setState({
      zoom: Math.min(this.state.zoom * 1.62, 20)
    });
  }

  onMapDrag (x, y) {
    this.setState({
      x: x,
      y: y
    });
  }

  resetView () {
    this.setState({
      zoom: 1,
      x: 0.5,
      y: 0.5
    });
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

  zoomOut () {
    this.setState({
      zoom: Math.max(this.state.zoom / 1.62, 1)
    });
  }

  toggleView (e) {
    this.setState({ winnerView: !this.state.winnerView });
  }

  geolocate () {
    this.setState({
      geolocating: true
    });
    //try to retrieve the users location
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
      xyz: [this.state.x, this.state.y, this.state.zoom]
        .map(d => Math.round(d * 1000) / 1000)
        .join('/'),
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
          onMapDrag={this.onMapDrag}
          x={this.state.x}
          y={this.state.y}
          zoom={this.state.zoom}
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
          onZoomIn={this.onZoomIn}
          onZoomOut={this.zoomOut}
          resetView={this.resetView}
          selectCurrentLocation={this.selectCurrentLocation}
          currentZoom={this.state.zoom}
          resetable={this.state.zoom !== 1 || this.state.x !== 0.5 || this.state.y !== 0.5}
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
  onlyFlipped: PropTypes.bool.isRequired,
  viewableDistrict: PropTypes.string,
  onDistrictInspected: PropTypes.func.isRequired,
  onDistrictUninspected: PropTypes.func.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  onPartySelected: PropTypes.func.isRequired,
  toggleFlipped: PropTypes.func.isRequired,
  hasThird: PropTypes.bool.isRequired
};

MapContainer.defaultProps = {
  viewableDistrict: '',
  selectedParty: ''
};
