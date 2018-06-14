import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

const TimelineDistrict = (props) => {
  const line = d3.line()
    .x(d => props.x(d.year))
    .y(d => props.y(d.percent))
    .curve(d3.curveCatmullRom);
  const lineData = [];
  Object.keys(props.districtData).forEach((year) => {
    if (props.districtData[year].regularized_party_of_victory !== 'third' && props.districtData[year].percent_vote > 0) {
      lineData.push({
        year: year,
        percent: (props.districtData[year].regularized_party_of_victory === 'democrat') ? props.districtData[year].percent_vote * -1 : props.districtData[year].percent_vote
      });
    }
  });
  const getDistrictY = (districtData) => {
    if (!districtData) {
      return;
    }
    let y = props.y(1) + props.axisHeight;
    if (districtData.percent_vote > 0) {
      if (districtData.regularized_party_of_victory === 'democrat') {
        y = props.y(districtData.percent_vote * -1);
      } else if (districtData.regularized_party_of_victory === 'republican' || districtData.regularized_party_of_victory === 'whig') {
        y = props.y(districtData.percent_vote);
      }
    }
    return y;
  };

  return (
    <React.Fragment>
      <rect
        x={props.x(1824)}
        y={props.y(-1)}
        width={props.x(2016) - props.x(1824)}
        height={props.y(0) - props.y(-1)}
        fill={getColorForParty('democrat')}
        fillOpacity={0.2}
      />

      <rect
        x={props.x(1856)}
        y={props.y(0)}
        width={props.x(2016) - props.x(1856)}
        height={props.y(1) - props.y(0)}
        fill={getColorForParty('republican')}
        fillOpacity={0.2}
      />

      <rect
        x={props.x(1824)}
        y={props.y(0)}
        width={props.x(1854) - props.x(1824)}
        height={props.y(1) - props.y(0)}
        fill={getColorForParty('whig')}
        fillOpacity={0.2}
      />

      <line
        x1={props.x(1824)}
        x2={props.x(2016)}
        y1={props.y(-0.75)}
        y2={props.y(-0.75)}
        stroke='#233036'
        strokeWidth={0.5}
      />

      <line
        x1={props.x(1824)}
        x2={props.x(2016)}
        y1={props.y(0.5)}
        y2={props.y(0.5)}
        stroke='#233036'
        strokeWidth={2}
      />

      <line
        x1={props.x(1824)}
        x2={props.x(2016)}
        y1={props.y(0.75)}
        y2={props.y(0.75)}
        stroke='#233036'
        strokeWidth={0.5}
      />

      <path
        d={line(lineData)}
        stroke='white'
        strokeWidth={2}
        fill='transparent'
      />

      { Object.keys(props.districtData).map((year) => {
        if (['democrat', 'republican', 'whig'].includes(props.districtData[year].regularized_party_of_victory)) {
          return (
            <circle
              cx={props.x(year)}
              cy={getDistrictY(props.districtData[year])}
              r={5}
              fill={getColorForMargin(props.districtData[year].regularized_party_of_victory, 1)}
              stroke='transparent'
              key={`districtMOVFor-${year}`}
            />
          );
        } else if (props.districtData[year].regularized_party_of_victory === 'third') {
          return (
            <rect
              x={props.x(year - 1)}
              y={props.y(-1)}
              width={props.x(1863) - props.x(1861)}
              height={props.y(1) - props.y(-1)}
              fill={getColorForParty('third')}
              fillOpacity={0.5}
              key={`districtMOVFor-${year}`}
            />
          );
        }
        return '';
      })}
    </React.Fragment>
  );
};

export default TimelineDistrict;

TimelineDistrict.propTypes = {
  districtData: PropTypes.objectOf(PropTypes.object).isRequired,
  x: PropTypes.func.isRequired,
  y: PropTypes.func.isRequired,
  axisHeight: PropTypes.number.isRequired
};
