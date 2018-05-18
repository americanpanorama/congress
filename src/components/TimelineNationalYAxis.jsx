import * as React from 'react';
import PropTypes from 'prop-types';

const TimelineNationalYAxis = props => (
  <React.Fragment>
    <line
      x1={props.shortTickHeight}
      x2={props.shortTickHeight}
      y1={props.y(props.maxDemocrats * -1)}
      y2={props.y(props.maxRepublicans)}
      stroke='white'
    />

    { [-300, -200, -100, 0, 100, 200, 300].map(members => (
      <g key={`ytickFor-${members}`}>
        <line
          x1={0}
          x2={props.shortTickHeight}
          y1={props.y(members)}
          y2={props.y(members)}
          stroke='white'
        />
        <text
          x={props.shortTickHeight * 2}
          y={props.y(members) + 6}
          fill='white'
        >
          { Math.abs(members) }
        </text>
      </g>
    ))}
  </React.Fragment>
);

export default TimelineNationalYAxis;

TimelineNationalYAxis.propTypes = {
  y: PropTypes.func.isRequired,
  shortTickHeight: PropTypes.number.isRequired,
  maxDemocrats: PropTypes.number.isRequired,
  maxRepublicans: PropTypes.number.isRequired
};
