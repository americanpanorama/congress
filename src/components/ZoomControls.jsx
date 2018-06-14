import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

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
        width={props.dimensions.zoomControlsHeight}
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
            strokeWidth={props.dimensions.zoomControlsHeight / 10}
          />
          <line
            x1={0}
            x2={0}
            y1={props.dimensions.zoomControlsHeight / -4}
            y2={props.dimensions.zoomControlsHeight / 4}
            stroke='#233036'
            strokeWidth={props.dimensions.zoomControlsHeight / 10}
          />
        </g>
      </svg>
    </button>

    <button
      onClick={props.onZoomOut}
      style={{
        marginLeft: props.dimensions.zoomControlsHeight / 4,
        marginRight: props.dimensions.zoomControlsHeight / 4
      }}
    >
      <svg
        width={props.dimensions.zoomControlsHeight}
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
            strokeWidth={props.dimensions.zoomControlsHeight / 10}
          />
        </g>
      </svg>
    </button>

    {/* button for national view */}
    <button
      onClick={props.resetView}
      title='reset view'
      style={{
        marginRight: props.dimensions.zoomControlsHeight / 4
      }}
    >
      <svg
        width={props.dimensions.zoomControlsHeight}
        height={props.dimensions.zoomControlsHeight}
      >
        <g transform={`translate(${props.dimensions.zoomControlsHeight / 2} ${props.dimensions.zoomControlsHeight / 2}) rotate(90)`}>
          <circle
            cx={0}
            cy={0}
            r={props.dimensions.zoomControlsHeight / 2}
            fill='silver'
            fillOpacity={(props.resetable) ? 1 : 0.7}
          />
          <path
            d={`${d3.arc()
              .innerRadius(props.dimensions.zoomControlsHeight / 4 - props.dimensions.zoomControlsHeight / 20)
              .outerRadius(props.dimensions.zoomControlsHeight / 4 + props.dimensions.zoomControlsHeight / 20)
              .startAngle(0)
              .endAngle(Math.PI * 1.9)()
              .slice(0, -1)}`
            }
            fill={(props.resetable) ? '#233036' : '#73797C'}
          />
          <polygon
            transform={`translate(0, ${props.dimensions.zoomControlsHeight / -20})`}
            points={`${Math.sin(0.19) * props.dimensions.zoomControlsHeight / -4}, ${props.dimensions.zoomControlsHeight / -4} ${Math.sin(0.19) * props.dimensions.zoomControlsHeight / -4}, ${0} ${Math.sin(0.19) * props.dimensions.zoomControlsHeight / -4 - props.dimensions.zoomControlsHeight / 4}, ${props.dimensions.zoomControlsHeight / -4}`}
            fill={(props.resetable) ? '#233036' : '#73797C'}
          />
        </g>
      </svg>
    </button>

    { !props.geolocating ?
      <button
        onClick={props.selectCurrentLocation}
        title='select your location'
      >
        <svg
          width={props.dimensions.zoomControlsHeight}
          height={props.dimensions.zoomControlsHeight}
        >
          <g transform={`translate(${props.dimensions.zoomControlsHeight / 2} ${props.dimensions.zoomControlsHeight / 2}) rotate(90)`}>
            <circle
              cx={0}
              cy={0}
              r={props.dimensions.zoomControlsHeight / 2}
              fill='silver'
              fillOpacity={1}
            />

            <line
              x1={props.dimensions.zoomControlsHeight / -3}
              x2={props.dimensions.zoomControlsHeight / 3}
              y1={0}
              y2={0}
              stroke='#233036'
              strokeWidth={props.dimensions.zoomControlsHeight / 15}
            />

            <line
              x1={0}
              x2={0}
              y1={props.dimensions.zoomControlsHeight / -3}
              y2={props.dimensions.zoomControlsHeight / 3}
              stroke='#233036'
              strokeWidth={props.dimensions.zoomControlsHeight / 15}
            />

            <circle
              cx={0}
              cy={0}
              r={props.dimensions.zoomControlsHeight / 4.5}
              fill='silver'
              fillOpacity={1}
              stroke={'#233036'}
              strokeWidth={props.dimensions.zoomControlsHeight / 15}
            />

            <circle
              cx={0}
              cy={0}
              r={props.dimensions.zoomControlsHeight / 8}
              fill={'#233036'}
            />

          </g>
        </svg>
      </button> :
      <button title='geolocating'>
        <svg
          width={props.dimensions.zoomControlsHeight}
          height={props.dimensions.zoomControlsHeight}
        >
          <g transform={`translate(${props.dimensions.zoomControlsHeight / 2} ${props.dimensions.zoomControlsHeight / 2})`}>
            <circle
              cx={0}
              cy={0}
              r={props.dimensions.zoomControlsHeight / 2}
              fill='silver'
              fillOpacity={1}
            />
            <path
              d={`${d3.arc()
                .innerRadius(props.dimensions.zoomControlsHeight / 4 - props.dimensions.zoomControlsHeight / 20)
                .outerRadius(props.dimensions.zoomControlsHeight / 4 + props.dimensions.zoomControlsHeight / 20)
                .startAngle(0)
                .endAngle(Math.PI * 1.5)()
                .slice(0, -1)}`
              }
              fill={'#233036'}
            >
              <animateTransform 
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 0 0"
                to="360 0 0"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </svg>
      </button>

    }

  </div>
);

export default ZoomControls;

ZoomControls.propTypes = {
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  resetView: PropTypes.func.isRequired,
  selectCurrentLocation: PropTypes.func.isRequired,
  currentZoom: PropTypes.number.isRequired,
  resetable: PropTypes.bool.isRequired,
  geolocating: PropTypes.bool.isRequired,
  dimensions: PropTypes.object.isRequired
};
