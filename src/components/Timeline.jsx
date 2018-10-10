import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import Steamgraph from './Steamgraph';
import TimelineDistrict from './TimelineDistrict';
import TimelineXAxis from './TimelineXAxis';
import TimelineDistrictYAxis from './TimelineDistrictYAxis';
import TimelineNationalYAxis from './TimelineNationalYAxis';
import DimensionsStore from '../stores/DimensionsStore';

const Timeline = (props) => {
  const dimensions = DimensionsStore.getDimensions();

  const y = d3.scaleLinear()
    .domain([-1 * props.maxDemocrats, props.maxRepublicans])
    .range([0, dimensions.timelineSteamgraphHeight - dimensions.timelineSteamgraphGutter * 2]);
  const yDistrict = d3.scaleLinear()
    .domain([-1, -1, -0.5, 0, 0.5, 1, 1])
    .range([y(props.maxRepublicans * 1), y(props.maxRepublicans * -1), y(0), y(0),
      y(0), y(props.maxRepublicans), y(props.maxRepublicans)]);

  const steamgraphTranslateX = 25;
  const steamgraphTranslateY = dimensions.timelineHorizontalGutter;
  const steamgraphScaleX = dimensions.timelineWidth - steamgraphTranslateX;
  const steamgraphScaleY = dimensions.timelineSteamgraphHeight -
    dimensions.timelineSteamgraphGutter * 2;

  return (
    <aside
      id='info'
      style={{
        width: dimensions.timelineWidth,
        height: dimensions.timelineHeight,
        bottom: dimensions.gutterPadding,
        left: dimensions.sidebarWidth + dimensions.gutterPadding * 2,
        cursor: 'pointer'
      }}
    >
      <svg
        width={dimensions.timelineWidth + DimensionsStore.getDimensions().timelineYAxisWidth}
        height={dimensions.timelineHeight}
      >
        {/* x axis: years */}
        <g transform={`translate(0 ${dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphHeight})`}>
          <TimelineXAxis
            electionYears={props.electionYears}
          />
        </g>

        {/* y axis */}
        <g transform={`translate(${dimensions.timelineWidth} ${dimensions.timelineHorizontalGutter})`}>
          { (props.districtData) ?
            <TimelineDistrictYAxis
              y={yDistrict}
              dimensions={dimensions}
            /> :
            <TimelineNationalYAxis
              y={y}
              maxDemocrats={props.maxDemocrats}
              maxRepublicans={props.maxRepublicans}
              dimensions={dimensions}
            />
          }
        </g>

        {/* steamgraph data */}
        { (props.districtData) ?
          <g transform={`translate(0 ${dimensions.timelineHorizontalGutter})`}>
            <TimelineDistrict
              electionYears={props.electionYears}
              districtData={props.districtData}
              y={yDistrict}
              axisHeight={dimensions.timelineAxisLongTickHeight + dimensions.timelineSteamgraphHeight -
                (y(props.maxRepublicans) - y(props.maxDemocrats * -1))}
            />
          </g> :
          <g
            transform={`translate(${steamgraphTranslateX} ${steamgraphTranslateY})
              scale(${steamgraphScaleX} ${steamgraphScaleY})`}
          >
            <Steamgraph
              steamgraphPaths={props.steamgraphPaths}
            />
          </g>
        }

        {/* clickable areas to select year */}
        { props.electionYears.map(year => (
          <rect
            x={DimensionsStore.timelineX(year - 1)}
            y={0}
            width={DimensionsStore.timelineX(1862) - DimensionsStore.timelineX(1860)}
            height={dimensions.timelineHeight}
            stroke='#999'
            strokeWidth={0}
            fill='transparent'
            key={`clickbox${year}`}
            id={year}
            onClick={props.onYearSelected}
          />
        ))}

      </svg>
    </aside>
  );
};

export default Timeline;

Timeline.propTypes = {
  steamgraphPaths: PropTypes.arrayOf(PropTypes.object).isRequired,
  electionYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  maxDemocrats: PropTypes.number.isRequired,
  maxRepublicans: PropTypes.number.isRequired,
  onYearSelected: PropTypes.func.isRequired,
  districtData: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]).isRequired
};
