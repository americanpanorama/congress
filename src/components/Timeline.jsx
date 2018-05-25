import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import Steamgraph from './Steamgraph';
import TimelineDistrict from './TimelineDistrict';
import TimelineXAxis from './TimelineXAxis';
import TimelineDistrictYAxis from './TimelineDistrictYAxis';
import TimelineNationalYAxis from './TimelineNationalYAxis';
import TimelineHandle from './TimelineHandle';
import DimensionsStore from '../stores/DimensionsStore';
import { getColorForParty, getColorForMargin, yearForCongress } from '../utils/HelperFunctions';

export default class Timeline extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      selectedX: this.x()(this.props.selectedYear),
      demCount: this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin + ((this.props.partyCountForSelectedYear.demAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.demAboveMargin + ')' : '' ),
      demCountY: this.y()((this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin)/-2),
      notDemCount: (this.props.selectedYear >= 1856) ? this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin + ((this.props.partyCountForSelectedYear.repAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.repAboveMargin + ')' : '' ) : this.props.partyCountForSelectedYear.whigAboveMargin + this.props.partyCountForSelectedYear.whigBelowMargin + ((this.props.partyCountForSelectedYear.whigAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.whigAboveMargin + ')' : '' ),
      notDemCountY: this.y()((this.props.selectedYear >= 1856) ? (this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin)/2 : (this.props.partyCountForSelectedYear.whigAboveMargin + this.props.partyCountForSelectedYear.whigBelowMargin)/2),
      districtPercentY: this.getDistrictY(this.props.districtData[this.props.selectedYear]),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedYear !== nextProps.selectedYear) {
      let demChange = (nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin) -(this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin),
        notDemChange = (nextProps.selectedYear >= 1856 && this.props.selectedYear < 1856 || nextProps.selectedYear < 1856 && this.props.selectedYear >= 1856) ? '' : (nextProps.selectedYear >= 1856) ? (nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin) -(this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin) : (nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin) -(this.props.partyCountForSelectedYear.whigAboveMargin + this.props.partyCountForSelectedYear.whigBelowMargin);

      d3.select(this.refs['demCount'])
        .transition()
        .duration(2000)
          .attr('y', this.y()((nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin)/-2))
          .text(((demChange > 0) ? '+' : '') + demChange);
      d3.select(this.refs['notDemCount'])
        .transition()
        .duration(2000)
          .attr('y', (notDemChange) ? this.y()((this.props.selectedYear >= 1856) ? (nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin)/2 : (nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin)/2) : 0)
          .text(((notDemChange && notDemChange > 0) ? '+' : '') + notDemChange);

      d3.select(this.refs['selectedLine']).selectAll('circle')
        .transition()
        .duration(2000)
          .attr('cy', this.getDistrictY(nextProps.districtData[nextProps.selectedYear]));       

      d3.select(this.refs['selectedLine'])
        .transition()
        .duration(2000)
          .attr('transform', 'translate(' + this.x()(nextProps.selectedYear) + ' ' + (DimensionsStore.getDimensions().timelineHorizontalGutter  + DimensionsStore.getDimensions().timelineSteamgraphGutter) + ')')
        .on('end', () => {
          this.setState({
            selectedX: this.x()(nextProps.selectedYear),
            demCountY: this.y()((nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin)/-2),
            demCount: nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin + ((this.props.partyCountForSelectedYear.demAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.demAboveMargin + ')' : '' ),
            notDemCount: (nextProps.selectedYear >= 1856) ? nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin + ((nextProps.partyCountForSelectedYear.repAboveMargin > 0) ? ' (+' + nextProps.partyCountForSelectedYear.repAboveMargin + ')' : '' ) : nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin + ((nextProps.partyCountForSelectedYear.whigAboveMargin > 0) ? ' (+' + nextProps.partyCountForSelectedYear.whigAboveMargin + ')' : '' ),
            notDemCountY: this.y()((nextProps.selectedYear >= 1856) ? (nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin)/2 : (nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin)/2),
            districtPercentY: this.getDistrictY(nextProps.districtData[nextProps.selectedYear])
      
          });
        });
    }

    else if (nextProps.districtData) {
      this.setState({
        districtPercentY: this.getDistrictY(nextProps.districtData[nextProps.selectedYear])
      });
    }
  }

  x() { 
    return d3.scaleLinear()
      .domain([1824, 2016])
      .range([15, DimensionsStore.getDimensions().timelineWidth]);
  }

  y() {
    return d3.scaleLinear()
      .domain([-1*this.props.maxDemocrats, this.props.maxRepublicans])
      .range([0, DimensionsStore.getDimensions().timelineSteamgraphHeight - DimensionsStore.getDimensions().timelineSteamgraphGutter * 2]);
  }

  yDistrict() {
    return d3.scaleLinear()
      .domain([-1, -1, -0.5, 0, 0.5, 1, 1])
      .range([this.y()(this.props.bottomOffset*-1), this.y()(this.props.bottomOffset*-1), this.y()(0), this.y()(0), this.y()(0), this.y()(this.props.bottomOffset), this.y()(this.props.bottomOffset)]);
  }

  getDistrictY (districtData) {
    if (!districtData) {
      return;
    }
    let y = this.yDistrict()(1) + DimensionsStore.getDimensions().timelineAxisShortTickHeight;
    if (districtData.regularized_party_of_victory == 'third') {
      y = this.yDistrict()(0.5);
    } else if (districtData.percent_vote > 0) {
      if (districtData.regularized_party_of_victory == 'democrat') {
        y = this.yDistrict()(districtData.percent_vote * -1);
      } else if (districtData.regularized_party_of_victory == 'republican' || districtData.regularized_party_of_victory == 'whig') {
        y = this.yDistrict()(districtData.percent_vote);
      }
    }
    return y; 
  }

  render () {
    const dimensions = DimensionsStore.getDimensions();
    const x = d3.scaleLinear()
      .domain([1824, 2016])
      .range([15, dimensions.timelineWidth]);
    const y = d3.scaleLinear()
      .domain([-1 * this.props.maxDemocrats, this.props.maxRepublicans])
      .range([0, dimensions.timelineSteamgraphHeight - dimensions.timelineSteamgraphGutter * 2]);
    const yDistrict = d3.scaleLinear()
      .domain([-1, -1, -0.5, 0, 0.5, 1, 1])
      .range([y(this.props.maxRepublicans * 1), y(this.props.maxRepublicans * -1), y(0), y(0),
        y(0), y(this.props.maxRepublicans), y(this.props.maxRepublicans)]);

    return (
      <aside
        id='info'
        style={{
          width: dimensions.timelineWidth,
          height: dimensions.timelineHeight,
          bottom: dimensions.gutterPadding,
          left: dimensions.sidebarWidth + dimensions.gutterPadding * 2
        }}
      >
        <svg
          width={dimensions.timelineWidth + DimensionsStore.getDimensions().timelineYAxisWidth}
          height={dimensions.timelineHeight}
        >
          {/* x axis: years */}
          <g transform={`translate(0 ${dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphHeight})`}>
            <TimelineXAxis
              x={x}
              longTickHeight={dimensions.timelineAxisLongTickHeight}
              shortTickHeight={dimensions.timelineAxisShortTickHeight}
              height={dimensions.timelineAxisHeight - 2 * dimensions.timelineAxisGutter}
              fontSize={dimensions.timelineAxisFontSize}
            />
          </g>

          {/* y axis */}
          <g transform={`translate(${dimensions.timelineWidth} ${dimensions.timelineHorizontalGutter})`}>
            { (this.props.districtData) ?
              <TimelineDistrictYAxis
                y={yDistrict}
                shortTickHeight={dimensions.timelineAxisShortTickHeight}
              /> :
              <TimelineNationalYAxis
                y={y}
                shortTickHeight={dimensions.timelineAxisShortTickHeight}
                maxDemocrats={this.props.maxDemocrats}
                maxRepublicans={this.props.maxRepublicans}
              />
            }
          </g>

          {/* steamgraph data */}
          <g transform={'translate(0 ' + (dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphGutter) + ')'}>
            { (this.props.districtData) ?
              <TimelineDistrict
                districtData={this.props.districtData}
                y={yDistrict}
                width={dimensions.timelineWidth}
                height={dimensions.timelineHeight}
              /> :
              <Steamgraph
                partyCount={this.props.partyCount}
                partyCountKeys={this.props.partyCountKeys}
                y={y}
                width={dimensions.timelineWidth}
                height={dimensions.timelineHeight}
              />
            }
          </g>

          {/* selected */}
          <g 
            transform={'translate(' + this.state.selectedX + ' ' + (dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphGutter) + ')'}
            ref='selectedLine'
          >
            { (this.props.districtData) ?
              <circle
                cx={0}
                cy={ this.state.districtPercentY }
                r={ 7 }
                fill={ getColorForMargin(this.props.districtData[this.props.selectedYear].regularized_party_of_victory, 1) }
                stroke={ '#F0B67F' }
              /> : ''
            }
          </g>

          {/* clickable areas to select year */}
          { this.props.congressYears.map(year => 
            <rect
              x={x(year)-(x(1862) - x(1861))}
              y={0}
              width={x(1862) - x(1860)}
              height={dimensions.timelineHeight}
              stroke='#999'
              strokeWidth={0}
              fill='transparent'
              key={'clickbox'+year}
              id={year}
              onClick={ this.props.onYearSelected }
            />
          )}

        </svg>
      </aside>
    );
  }
}