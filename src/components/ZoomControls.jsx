import * as React from 'react';
import PropTypes from 'prop-types';

const ZoomControls = props => (
  <div
    id='mapChartControls'
    style={{
      height: props.dimensions.zoomControlsHeight,
      width: props.dimensions.zoomControlsWidth,
      right: 0,
      bottom: props.dimensions.zoomControlsBottom
    }}
  >
    <button
      onClick={props.onZoomIn}
      id='zoomInButton'
    >
      <svg
        width={props.dimensions.zoomControlsWidth}
        height={props.dimensions.zoomControlsHeight}
      >
        <g transform={`translate(${props.dimensions.zoomControlsHeight / 2} ${props.dimensions.zoomControlsHeight / 2})`}>
          <circle
            cx={0}
            cy={0}
            r={props.dimensions.zoomControlsHeight / 2}
            fill='silver'
          />
          <line
            x1={props.dimensions.zoomControlsHeight / -4}
            x2={props.dimensions.zoomControlsHeight / 4}
            y1={0}
            y2={0}
            stroke='#233036'
            strokeWidth={4}
          />
          <line
            x1={0}
            x2={0}
            y1={props.dimensions.zoomControlsHeight / -4}
            y2={props.dimensions.zoomControlsHeight / 4}
            stroke='#233036'
            strokeWidth={4}
          />
        </g>
      </svg>
    </button>

    <button
      onClick={props.onZoomOut}
    >
      <svg
        width={props.dimensions.zoomControlsWidth}
        height={props.dimensions.zoomControlsHeight}
      >
        <g transform={`translate(${props.dimensions.zoomControlsHeight / 2} ${props.dimensions.zoomControlsHeight / 2})`}>
          <circle
            cx={0}
            cy={0}
            r={props.dimensions.zoomControlsHeight / 2}
            fill='silver'
            fillOpacity={(props.currentZoom > 1) ? 1 : 0.7}
          />
          <line
            x1={props.dimensions.zoomControlsHeight / -4}
            x2={props.dimensions.zoomControlsHeight / 4}
            y1={0}
            y2={0}
            stroke={(props.currentZoom > 1) ? '#233036' : '#73797C'}
            strokeWidth={4}
          />
        </g>
      </svg>
    </button>

    {/* button for national view */}
    <button
      onClick={props.resetView}
    >
      <svg
        width={props.dimensions.zoomControlsWidth}
        height={props.dimensions.zoomControlsHeight}
      >
        <defs>
          <marker id="arrow" markerWidth="4" markerHeight="4" refX="0" refY="0" orient="auto" markerUnits="strokeWidth">
            <path d='M0,0 L0,1, L1,0 z' fill='#f00' />
          </marker>
        </defs>
        <g transform={`translate(${props.dimensions.zoomControlsHeight / 2} ${props.dimensions.zoomControlsHeight / 2}) rotate(45)`}>
          <circle
            cx={0}
            cy={0}
            r={props.dimensions.zoomControlsHeight / 2}
            fill='silver'
            fillOpacity={(props.currentZoom > 1) ? 1 : 0.7}
          />
          <line
            x1={props.dimensions.zoomControlsHeight / -4}
            x2={props.dimensions.zoomControlsHeight / 4}
            y1={0}
            y2={0}
            stroke={(props.currentZoom > 1) ? '#233036' : '#73797C'}
            strokeWidth={4}
          />
          <line
            x1={0}
            x2={0}
            y1={props.dimensions.zoomControlsHeight / -4}
            y2={props.dimensions.zoomControlsHeight / 4}
            stroke={(props.currentZoom > 1) ? '#233036' : '#73797C'}
            strokeWidth={4}
          />
        </g>
      </svg>
    </button>
  </div>
);

export default ZoomControls;

ZoomControls.propTypes = {
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  resetView: PropTypes.func.isRequired,
  currentZoom: PropTypes.number.isRequired,
  dimensions: PropTypes.object.isRequired
};
