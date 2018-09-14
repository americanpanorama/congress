import * as React from 'react';
import PropTypes from 'prop-types';

const TimelineDistrictYAxis = props => (
  <React.Fragment>
    <line
      x1={props.dimensions.timelineAxisShortTickHeight}
      x2={props.dimensions.timelineAxisShortTickHeight}
      y1={props.y(-1)}
      y2={props.y(1)}
      stroke='white'
    />

    { [-1, -0.75, 0.5, 0.75, 1].map(percent => (
      <g key={`ytickFor${percent}`}>
        <line
          x1={0}
          x2={props.dimensions.timelineAxisShortTickHeight}
          y1={props.y(percent)}
          y2={props.y(percent)}
          stroke='white'
        />
        <text
          x={props.dimensions.timelineAxisShortTickHeight * 2}
          y={props.y(percent) + props.dimensions.timelineAxisFontSize / 2}
          fill='white'
          style={{
            fontSize: props.dimensions.timelineAxisFontSize,
            fontWeight: 100
          }}
        >
          {`${Math.round(Math.abs(percent * 100))}%`}
        </text>
        { (percent === 0.5) &&
          <text
            x={props.dimensions.timelineAxisShortTickHeight * 2}
            y={props.y(percent) + props.dimensions.timelineAxisFontSize * 1.25}
            fill='white'
            style={{
              fontSize: props.dimensions.timelineAxisFontSize * 2 / 3,
              fontWeight: 100
            }}
          >
            or less
          </text>
        }
      </g>
    ))}

    <text
      x={props.dimensions.timelineAxisShortTickHeight * 2}
      y={props.y(-1) - 15}
      fill='white'
      textAnchor='middle'
    >
      strength of victory
    </text>

    <text
      x={props.dimensions.timelineAxisShortTickHeight * 2}
      y={props.y(1) + props.dimensions.timelineAxisOffsetForDistrict + 6}
      fill='white'
    >
      no data
    </text>
  </React.Fragment>
);

export default TimelineDistrictYAxis;

TimelineDistrictYAxis.propTypes = {
  y: PropTypes.func.isRequired,
  dimensions: PropTypes.shape({
    timelineAxisOffsetForDistrict: PropTypes.number,
    timelineAxisShortTickHeight: PropTypes.number,
    timelineAxisFontSize: PropTypes.number
  }).isRequired
};
