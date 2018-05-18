import * as React from 'react';
import PropTypes from 'prop-types';

const TimelineDistrictYAxis = props => (
  <React.Fragment>
    <line
      x1={props.shortTickHeight}
      x2={props.shortTickHeight}
      y1={props.y(-1)}
      y2={props.y(1)}
      stroke='white'
    />

    { [-1, -0.75, 0.5, 0.75, 1].map(percent => (
      <g key={`ytickFor${percent}`}>
        <line
          x1={0}
          x2={props.shortTickHeight}
          y1={props.y(percent)}
          y2={props.y(percent)}
          stroke='white'
        />
        <text
          x={props.shortTickHeight * 2}
          y={props.y(percent) + 6}
          fill='white'

        >
          {`${Math.round(Math.abs(percent * 100))}%${(percent === 0.5) ? ' or less' : ''}`}
        </text>
      </g>
    ))}
  </React.Fragment>
);

export default TimelineDistrictYAxis;

TimelineDistrictYAxis.propTypes = {
  y: PropTypes.func.isRequired,
  shortTickHeight: PropTypes.number.isRequired
};
