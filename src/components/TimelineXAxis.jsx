import * as React from 'react';
import PropTypes from 'prop-types';
import DimensionsStore from '../stores/DimensionsStore';

const TimelineXAxis = (props) => {
  const dimensions = DimensionsStore.getDimensions();
  const longTickHeight = dimensions.timelineAxisLongTickHeight;
  const shortTickHeight = dimensions.timelineAxisShortTickHeight;
  const fontSize = dimensions.timelineAxisFontSize;
  const labelY = longTickHeight + fontSize * 1.2;

  const decades = props.electionYears.filter(y => y % 10 === 0);

  return (
    <React.Fragment>
      <line
        x1={DimensionsStore.timelineX(Math.min(...props.electionYears))}
        x2={DimensionsStore.timelineX(Math.max(...props.electionYears))}
        y1={longTickHeight}
        y2={longTickHeight}
        stroke='white'
      />

      { props.electionYears.map(year => (
        <line
          x1={DimensionsStore.timelineX(year)}
          x2={DimensionsStore.timelineX(year)}
          y1={(year % 10 === 0) ? 0 : longTickHeight - shortTickHeight}
          y2={longTickHeight}
          stroke='white'
          strokeWidth={1}
          key={`tickFor-${year}`}
        />
      ))}

      { decades.map(year => (
        <text
          x={DimensionsStore.timelineX(year)}
          y={labelY}
          textAnchor='middle'
          key={`yearFor-${year}`}
          fill='white'
          style={{
            fontSize: fontSize
          }}
          fontWeight={100}
        >
          {year}
        </text>
      ))}
    </React.Fragment>
  );
};

export default TimelineXAxis;

TimelineXAxis.propTypes = {
  electionYears: PropTypes.arrayOf(PropTypes.number).isRequired
};
