import * as React from 'react';
import PropTypes from 'prop-types';
import { yearForCongress, congressForYear } from '../utils/HelperFunctions';

const TimelineXAxis = props => (
  <React.Fragment>
    <line
      x1={props.x(1824)}
      x2={props.x(2016)}
      y1={props.longTickHeight}
      y2={props.longTickHeight}
      stroke='white'
    />

    { Array.from({ length: (2016 - 1824) / 2 }, (v, i) => 1824 + i * 2).map(year => (
      <line
        x1={props.x(year)}
        x2={props.x(year)}
        y1={(year % 10 === 0) ? 0 : props.longTickHeight - props.shortTickHeight}
        y2={props.longTickHeight}
        stroke='white'
        strokeWidth={1}
        key={`tickFor-${year}`}
      />
    ))}

    { Array.from({ length: (2020 - 1830) / 10 }, (v, i) => 1830 + i * 10).map(year => (
      <text
        x={props.x(year)}
        y={props.height}
        textAnchor='middle'
        key={`yearFor-${year}`}
        fill='white'
        style={{
          fontSize: props.fontSize
        }}
      >
        {year}
      </text>
    ))}
  </React.Fragment>
);

export default TimelineXAxis;

TimelineXAxis.propTypes = {
  x: PropTypes.func.isRequired,
  longTickHeight: PropTypes.number.isRequired,
  shortTickHeight: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  fontSize: PropTypes.number.isRequired
};
