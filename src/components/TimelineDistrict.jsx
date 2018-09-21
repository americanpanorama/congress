import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import DimensionsStore from '../stores/DimensionsStore';
import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

const TimelineDistrict = (props) => {
  const earliestYear = Math.min(...props.electionYears);
  const lastYear = Math.max(...props.electionYears);

  const line = d3.line()
    .x(d => DimensionsStore.timelineX(d.year))
    .y(d => props.y(d.percent))
    .curve(d3.curveCatmullRom);
  const lineData = [];
  props.districtData.forEach((yearData) => {
    const { partyReg, percent, year } = yearData;
    if (partyReg !== 'third' && percent > 0) {
      lineData.push({
        year: year,
        percent: (partyReg === 'democrat') ? percent * -1 : percent
      });
    }
  });
  const getDistrictY = (percent, partyReg) => {
    if (Number.isNaN(percent)) {
      return;
    }
    let y = props.y(1) + props.axisHeight;
    if (percent > 0) {
      if (partyReg === 'democrat') {
        y = props.y(percent * -1);
      } else if (partyReg === 'republican' || partyReg === 'whig') {
        y = props.y(percent);
      }
    }
    return y;
  };

  return (
    <React.Fragment>
      <rect
        x={DimensionsStore.timelineX(earliestYear)}
        y={props.y(-1)}
        width={DimensionsStore.timelineX(lastYear) - DimensionsStore.timelineX(earliestYear)}
        height={props.y(0) - props.y(-1)}
        fill={getColorForParty('democrat')}
        fillOpacity={0.2}
      />

      <rect
        x={DimensionsStore.timelineX(1856)}
        y={props.y(0)}
        width={DimensionsStore.timelineX(lastYear) - DimensionsStore.timelineX(1856)}
        height={props.y(1) - props.y(0)}
        fill={getColorForParty('republican')}
        fillOpacity={0.2}
      />

      <rect
        x={DimensionsStore.timelineX(earliestYear)}
        y={props.y(0)}
        width={DimensionsStore.timelineX(1854) - DimensionsStore.timelineX(earliestYear)}
        height={props.y(1) - props.y(0)}
        fill={getColorForParty('whig')}
        fillOpacity={0.2}
      />

      <line
        x1={DimensionsStore.timelineX(earliestYear)}
        x2={DimensionsStore.timelineX(lastYear)}
        y1={props.y(-0.75)}
        y2={props.y(-0.75)}
        stroke='#233036'
        strokeWidth={0.5}
      />

      <line
        x1={DimensionsStore.timelineX(earliestYear)}
        x2={DimensionsStore.timelineX(lastYear)}
        y1={props.y(0.5)}
        y2={props.y(0.5)}
        stroke='#233036'
        strokeWidth={2}
      />

      <line
        x1={DimensionsStore.timelineX(earliestYear)}
        x2={DimensionsStore.timelineX(lastYear)}
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

      { props.districtData.map((yearData) => {
        const { partyReg, percent, year } = yearData;
        if (['democrat', 'republican', 'whig'].includes(partyReg)) {
          return (
            <circle
              cx={DimensionsStore.timelineX(year)}
              cy={getDistrictY(percent, partyReg)}
              r={5}
              fill={getColorForMargin(partyReg, 1)}
              stroke='transparent'
              key={`districtMOVFor-${year}`}
            />
          );
        } else if (partyReg === 'third') {
          return (
            <rect
              x={DimensionsStore.timelineX(year - 1)}
              y={props.y(-1)}
              width={DimensionsStore.timelineX(1863) - DimensionsStore.timelineX(1861)}
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
  electionYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  districtData: PropTypes.arrayOf(PropTypes.object).isRequired,
  y: PropTypes.func.isRequired,
  axisHeight: PropTypes.number.isRequired
};
