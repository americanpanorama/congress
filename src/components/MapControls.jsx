import * as React from 'react';
import PropTypes from 'prop-types';
import ToggleButton from 'react-toggle-button';

const MapControls = (props) => {
  const {
    selectedView,
    winnerView,
    onViewSelected,
    toggleView,
    dimensions
  } = props;

  return (
    <div
      id='mapControls'
      style={{
        top: dimensions.vizControlsTop
      }}
    >
      <div
        id='vizControl'
        style={{
          right: dimensions.vizControlsRight,
          fontSize: dimensions.headerSubtitleFontSize,
          verticalAlign: 'top',
          lineHeight: '1em'
        }}
      >
        <span
          style={{
            color: (selectedView === 'cartogram') ? '#F0B67F' : '#aaa',
            verticalAlign: 'top',
            lineHeight: '1em'
          }}
          onClick={onViewSelected}
        >
          Cartogram
        </span>
        { true &&
          <ToggleButton
            value={selectedView === 'map'}
            onToggle={onViewSelected}
            inactiveLabel=''
            activeLabel=''
            containerStyle={{
              display: 'inline-block',
              width: dimensions.vizControlTrackHeight * 2,
              marginRight: 5,
              marginLeft: 5
            }}
            colors={{
              activeThumb: { base: 'pink' },
              inactiveThumb: { base: '#eee' },
              active: { base: '#777' },
              inactive: { base: '#777' }
            }}
            activeLabelStyle={{ fontSize: 1 }}
            inactiveLabelStyle={{ fontSize: 1 }}
            trackStyle={{
              height: dimensions.vizControlTrackHeight,
              width: dimensions.vizControlTrackHeight * 2
            }}
            thumbStyle={{
              height: dimensions.vizControlTrackHeight,
              width: dimensions.vizControlTrackHeight
            }}
            thumbAnimateRange={[0, dimensions.vizControlTrackHeight]}
          />
        }

        <span
          style={{
            color: (selectedView === 'map') ? '#F0B67F' : '#aaa',
            verticalAlign: 'top',
            lineHeight: '1em'
          }}
          onClick={onViewSelected}
        >
          Map
        </span>
      </div>

      <div
        id='winnerControl'
        style={{
          left: dimensions.winnerControlLeft,
          fontSize: dimensions.headerSubtitleFontSize,
          verticalAlign: 'top',
          lineHeight: '1em'
        }}
      >
        <span
          style={{
            color: (winnerView) ? '#F0B67F' : '#aaa',
            fontSize: dimensions.headerSubtitleFontSize,
            verticalAlign: 'top',
            lineHeight: '1em'
          }}
          onClick={toggleView}
        >
          Winner
        </span>
        <ToggleButton
          value={!winnerView}
          onToggle={toggleView}
          inactiveLabel=''
          activeLabel=''
          containerStyle={{
            display: 'inline-block',
            width: dimensions.vizControlTrackHeight * 2,
            marginRight: 5,
            marginLeft: 5
          }}
          colors={{
            activeThumb: { base: 'pink' },
            inactiveThumb: { base: '#eee' },
            active: { base: '#777' },
            inactive: { base: '#777' }
          }}
          activeLabelStyle={{ fontSize: 1 }}
          inactiveLabelStyle={{ fontSize: 1 }}
          trackStyle={{
            height: dimensions.vizControlTrackHeight,
            width: dimensions.vizControlTrackHeight * 2
          }}
          thumbStyle={{
            height: dimensions.vizControlTrackHeight,
            width: dimensions.vizControlTrackHeight
          }}
          thumbAnimateRange={[0, dimensions.vizControlTrackHeight]}
        />
        <span
          style={{
            color: (!winnerView) ? '#F0B67F' : '#aaa',
            fontSize: dimensions.headerSubtitleFontSize,
            verticalAlign: 'top',
            lineHeight: '1em'
          }}
          onClick={toggleView}
        >
            Strength of Victory
        </span>
      </div>
    </div>
  );
};

export default MapControls;

MapControls.propTypes = {
  selectedView: PropTypes.string.isRequired,
  winnerView: PropTypes.bool.isRequired,
  onViewSelected: PropTypes.func.isRequired,
  toggleView: PropTypes.func.isRequired,
  dimensions: PropTypes.shape({
    vizControlTrackHeight: PropTypes.number,
    headerSubtitleFontSize: PropTypes.number
  }).isRequired
};
