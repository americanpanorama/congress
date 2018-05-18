import * as React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import DimensionsStore from '../stores/DimensionsStore';

export default class TimelineHandle extends React.Component {
  constructor (props) {
    super(props);

    const notDemParty = (this.props.selectedYear >= 1856) ? 'rep' : 'whig';

    this.state = {
      activeDrags: 0,
      delta: 0,
      selectedYear: this.props.selectedYear,
      displayYear: this.props.selectedYear,
      controlledPosition: { x: -400, y: 200 },
      demText: this.getPartyText(this.props.selectedYear, 'dem'),
      demTextY: this.getNationalY(this.getPartyCount(this.props.selectedYear, 'dem') / -2),
      notDemText: this.getPartyText(this.props.selectedYear, notDemParty),
      notDemTextY: this.getNationalY(this.getPartyCount(this.props.selectedYear, notDemParty) / 2)
    };

    // bind handlers
    const handlers = ['handleMouseDown', 'handleDrag', 'handleMouseUp'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });

    this.handle = React.createRef();
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedYear !== nextProps.selectedYear) {
      this.setState({
        selectedYear: nextProps.selectedYear,
        displayYear: nextProps.selectedYear
      });
    }

    if (this.getPartyText(nextProps.selectedYear, 'dem') !== this.state.demText) {
      this.setState({ demText: this.getPartyText(nextProps.selectedYear, 'dem') });
    }
  }

  getNationalY (count) {
    return DimensionsStore.timelineNationalY(count, this.props.nationalDomain);
  }

  getPartyCount (year, party) {
    const partyCounts = this.props.partyCounts.find(pc => pc.year === year);
    const belowMargin = partyCounts[`${party}BelowMargin`];
    const aboveMargin = partyCounts[`${party}AboveMargin`];
    return belowMargin + aboveMargin;
  }

  getPartyText (year, party) {
    const partyCounts = this.props.partyCounts.find(pc => pc.year === year);
    let count = '';
    if (partyCounts) {
      const belowMargin = partyCounts[`${party}BelowMargin`];
      const aboveMargin = partyCounts[`${party}AboveMargin`];
      count += belowMargin + aboveMargin;
      if (aboveMargin > 0) {
        count += ` (+${aboveMargin})`;
      }
    }
    return count;
  }

  calculateNewYear (delta) {
    const theDelta = delta || this.state.delta;
    return Math.round(this.state.selectedYear + 2 * theDelta / DimensionsStore.timelineXTermSpan());
  }

  handleMouseUp () {
    const newYear = this.calculateNewYear();
    this.setState({
      delta: 0,
      selectedYear: newYear
    });
    this.props.onYearSelected(newYear);
  }

  handleMouseDown (e) {
    this.setState({ activeDrags: this.state.activeDrags + 1 });
  }

  handleDrag (e, ui) {
    const delta = this.state.delta + ui.deltaX;
    const newYear = this.calculateNewYear(delta);
    const notDemParty = (newYear >= 1856) ? 'rep' : 'whig';
    const demText = this.getPartyText(newYear, 'dem');
    const demTextY = this.getNationalY(this.getPartyCount(newYear, 'dem') / -2);
    const notDemText = this.getPartyText(newYear, notDemParty);
    const notDemTextY = this.getNationalY(this.getPartyCount(newYear, notDemParty) / 2);

    this.setState({
      displayYear: newYear,
      demText: demText,
      demTextY: demTextY,
      notDemText: notDemText,
      notDemTextY: notDemTextY,
      delta: delta
    });
  }

  render () {
    return (
      <Draggable
        axis='x'
        position={{ x: DimensionsStore.timelineX(this.state.selectedYear) - DimensionsStore.timelineXTermSpan() * 6, y: 0 }}
        grid={[DimensionsStore.timelineXTermSpan(), 0]}
        onStart={this.handleMouseDown}
        onStop={this.handleMouseUp}
        onDrag={this.handleDrag}
      >
        <svg
          width={DimensionsStore.timelineXTermSpan() * 12}
          height={DimensionsStore.getDimensions().timelineHeight - DimensionsStore.getDimensions().timelineHorizontalGutter}
          style={{
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <defs>
            <linearGradient id='selectedYearBackground'>
              <stop offset='0%' stopColor='#233036' stopOpacity={0} />
              <stop offset='33%' stopColor='#233036' stopOpacity={1} />
              <stop offset='67%' stopColor='#233036' stopOpacity={1} />
              <stop offset='100%' stopColor='#233036' stopOpacity={0} />
            </linearGradient>
          </defs>

          <g transform={`translate(${DimensionsStore.timelineXTermSpan() * 6})`}>
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={DimensionsStore.getDimensions().timelineSteamgraphHeight + DimensionsStore.getDimensions().timelineAxisLongTickHeight}
              stroke='#F0B67F'
              strokeWidth={4}
            />

            <text
              x={DimensionsStore.timelineXTermSpan() * -1}
              y={this.state.demTextY}
              textAnchor='end'
              fill='white'
              // style={{
              //   textShadow: '-1px 0 1px ' + getColorForMargin('democrat', 1) + ', 0 1px 1px ' + getColorForMargin('democrat', 1) + ', 1px 0 1px ' + getColorForMargin('democrat', 1) + ', 0 -1px 1px ' + getColorForMargin('democrat', 1)
              // }}
            >
              { this.state.demText }
            </text>

            <text
              x={DimensionsStore.timelineXTermSpan()}
              y={this.state.notDemTextY}
              textAnchor='start'
              fill='white'
              // style={{
              //   textShadow: '-1px 0 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1) + ', 0 1px 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1) + ', 1px 0 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1) + ', 0 -1px 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1)
              // }}
            >
              { this.state.notDemText }
            </text>

            <rect
              x={DimensionsStore.timelineXTermSpan() * -15}
              y={DimensionsStore.getDimensions().timelineSteamgraphHeight + DimensionsStore.getDimensions().timelineAxisLongTickHeight + 2}
              width={DimensionsStore.timelineXTermSpan() * 30}
              height={DimensionsStore.getDimensions().timelineAxisFontSizeSelected}
              fill='url(#selectedYearBackground)'
            />

            <text
              x={0}
              y={DimensionsStore.getDimensions().timelineSteamgraphHeight + DimensionsStore.getDimensions().timelineAxisHeight - DimensionsStore.getDimensions().timelineAxisShortTickHeight}
              textAnchor='middle'
              fill='#F0B67F'
              style={{
                fontSize: DimensionsStore.getDimensions().timelineAxisFontSizeSelected,
                fontWeight: 'bold'
              }}
            >
              {this.state.displayYear}
            </text>
          </g>
        </svg>
      </Draggable>
    );
  }
}

TimelineHandle.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  onYearSelected: PropTypes.func.isRequired,
  partyCounts: PropTypes.arrayOf(PropTypes.object).isRequired,
  nationalDomain: PropTypes.arrayOf(PropTypes.number).isRequired
};

TimelineHandle.defaultProps = {

};
