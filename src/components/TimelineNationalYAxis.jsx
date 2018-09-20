import * as React from 'react';
import PropTypes from 'prop-types';

const TimelineNationalYAxis = props => (
  <React.Fragment>
    <line
      x1={props.dimensions.timelineAxisShortTickHeight}
      x2={props.dimensions.timelineAxisShortTickHeight}
      y1={props.y(props.maxDemocrats * -1)}
      y2={props.y(Math.max(props.maxRepublicans, 300))}
      stroke='white'
    />

    { [-300, -200, -100, 0, 100, 200, 300].map(members => (
      <g key={`ytickFor-${members}`}>
        <line
          x1={0}
          x2={props.dimensions.timelineAxisShortTickHeight}
          y1={props.y(members)}
          y2={props.y(members)}
          stroke='white'
        />
        <text
          x={props.dimensions.timelineAxisShortTickHeight * 2}
          y={props.y(members) + props.dimensions.timelineAxisFontSize / 2}
          fill='white'
          style={{
            fontSize: props.dimensions.timelineAxisFontSize,
            fontWeight: 100
          }}
        >
          { Math.abs(members) }
        </text>
      </g>
    ))}

    <text
      x={props.dimensions.timelineYAxisWidth}
      y={props.y(props.maxDemocrats * -1) - 5}
      fill='white'
      textAnchor='end'
      fontWeight={100}
    >
      number of representatives
    </text>
  </React.Fragment>
);

export default TimelineNationalYAxis;

TimelineNationalYAxis.propTypes = {
  y: PropTypes.func.isRequired,
  dimensions: PropTypes.shape({
    timelineAxisShortTickHeight: PropTypes.number,
    timelineAxisFontSize: PropTypes.number,
    timelineYAxisWidth: PropTypes.number
  }).isRequired,
  maxDemocrats: PropTypes.number.isRequired,
  maxRepublicans: PropTypes.number.isRequired
};
