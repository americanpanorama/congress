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
      dragging: false,
      draggableX: this.props.timelineX - this.props.timelineXTermSpan * 10,
      delta: 0,
      selectedYear: this.props.selectedYear,
      displayYear: this.props.selectedYear,
      demText: this.getPartyText(this.props.selectedYear, 'dem'),
      demTextY: this.getNationalY(this.getPartyCount(this.props.selectedYear, 'dem') * -1),
      notDemText: this.getPartyText(this.props.selectedYear, notDemParty),
      notDemTextY: this.getNationalY(this.getPartyCount(this.props.selectedYear, notDemParty))
    };

    // bind handlers
    const handlers = ['handleMouseDown', 'handleDrag', 'handleMouseUp', 'onYearSelected'];
    handlers.forEach((handler) => { this[handler] = this[handler].bind(this); });

    this.handle = React.createRef();
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedYear !== nextProps.selectedYear) {
      const notDemParty = (this.props.selectedYear >= 1856) ? 'rep' : 'whig';

      this.setState({
        selectedYear: nextProps.selectedYear,
        displayYear: nextProps.selectedYear,
        draggableX: nextProps.timelineX - nextProps.timelineXTermSpan * 10,
        demText: this.getPartyText(nextProps.selectedYear, 'dem'),
        demTextY: this.getNationalY(this.getPartyCount(nextProps.selectedYear, 'dem') * -1),
        notDemText: this.getPartyText(nextProps.selectedYear, notDemParty),
        notDemTextY: this.getNationalY(this.getPartyCount(nextProps.selectedYear, notDemParty)),
        dragging: false
      });
    }
  }

  onYearSelected (e) {
    if (!this.state.dragging) {
      const newYear = parseInt((e.currentTarget) ? e.currentTarget.id : e, 10);
      this.props.onYearSelected(newYear);
    } else {
      {/* mouse up should have happened, I think */}
      this.setState({
        dragging: false
      });
    }
  }

  getNationalY (count) {
    return DimensionsStore.timelineNationalY(count, this.props.nationalDomain);
  }

  getPartyCount (year, party) {
    const {
      democrat,
      republican,
      whig
    } = this.props.partyCounts.find(pc => pc.year === year);
    if (party === 'dem') {
      return democrat;
    } else if (party === 'rep') {
      return republican;
    } else if (party === 'whig') {
      return whig;
    }
    return null;
  }

  getPartyText (year, party) {
    const {
      democrat,
      republican,
      whig
    } = this.props.partyCounts.find(pc => pc.year === year);
    const notDem = (year >= 1856) ? republican : whig;

    const belowMargin = Math.min(democrat, notDem);
    const aboveMargin = (party === 'dem') ? Math.max(democrat - notDem, 0) : Math.max(notDem - democrat, 0);

    const count = (
      <tspan
        x={(year < 1932) ? this.props.timelineXTermSpan : this.props.timelineXTermSpan * -1}
        dy='0.5em'
      >
        {belowMargin + aboveMargin}
      </tspan>
    );
    const majority = (aboveMargin > 0) ? (
      <tspan
        x={(year < 1932) ? this.props.timelineXTermSpan : this.props.timelineXTermSpan * -1}
        dy='1.2em'
        style={{ fontWeight: 100 }}
      >
        {`+${aboveMargin}`}
      </tspan>
    ) : '';
    // if (aboveMargin > 0) {
    //   count += ` (+${aboveMargin})`;
    // }
    return <React.Fragment>{count}{majority}</React.Fragment>;
  }

  calculateNewYear (delta) {
    const theDelta = delta || this.state.delta;
    return Math.round(this.state.selectedYear + 2 * theDelta / this.props.timelineXTermSpan);
  }

  handleMouseUp () {
    const newYear = this.calculateNewYear();

    if (newYear !== this.props.selectedYear) {
      this.setState({
        delta: 0,
        selectedYear: newYear,
        draggableX: this.state.draggableX + this.state.delta
      });
      this.props.onYearSelected(newYear);
    }
  }

  handleMouseDown (e, ui) {
    this.setState({ activeDrags: this.state.activeDrags + 1 });
  }

  handleDrag (e, ui) {
    const delta = this.state.delta + ui.deltaX;
    const newYear = this.calculateNewYear(delta);
    const notDemParty = (newYear >= 1856) ? 'rep' : 'whig';
    const demText = this.getPartyText(newYear, 'dem');
    const demTextY = this.getNationalY(this.getPartyCount(newYear, 'dem') * -1);
    const notDemText = this.getPartyText(newYear, notDemParty);
    const notDemTextY = this.getNationalY(this.getPartyCount(newYear, notDemParty));

    this.setState({
      displayYear: newYear,
      demText: demText,
      demTextY: demTextY,
      notDemText: notDemText,
      notDemTextY: notDemTextY,
      delta: delta,
      dragging: true
    });
  }

  render () {
    const {
      dimensions,
      timelineXTermSpan,
      selectedYear,
      showPartyCounts,
      districtCircleY,
      districtCircleFill
    } = this.props;

    return (
      <aside
        id='handle'
        style={{
          width: dimensions.timelineWidth,
          height: dimensions.timelineHeight - dimensions.timelineHorizontalGutter,
          bottom: dimensions.gutterPadding,
          left: dimensions.sidebarWidth + dimensions.gutterPadding * 2,
          pointerEvents: 'none',
          cursor: 'ew-resize'
        }}
      >
        <Draggable
          axis='x'
          position={{ x: this.state.draggableX, y: 0 }}
          grid={[timelineXTermSpan, 0]}
          onStart={this.handleMouseDown}
          onStop={this.handleMouseUp}
          onDrag={this.handleDrag}
        >
          <div>
            <svg
              width={timelineXTermSpan * 20}
              height={dimensions.timelineHeight - dimensions.timelineHorizontalGutter}
              style={{
                zIndex: 10000,
                pointerEvents: 'auto'
              }}
            >
              <defs>
                <linearGradient id='selectedYearBackground'>
                  <stop offset='0%' stopColor='#233036' stopOpacity={0} />
                  <stop offset='50%' stopColor='#233036' stopOpacity={1} />

                  <stop offset='100%' stopColor='#233036' stopOpacity={0} />
                </linearGradient>
              </defs>

              <g transform={`translate(${timelineXTermSpan * 10})`}>
                <line
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={dimensions.timelineSteamgraphHeight + dimensions.timelineAxisLongTickHeight}
                  stroke='#F0B67F'
                  strokeWidth={4}
                />

                <rect
                  x={timelineXTermSpan * -15}
                  y={dimensions.timelineSteamgraphHeight + dimensions.timelineAxisLongTickHeight + 2}
                  width={timelineXTermSpan * 30}
                  height={dimensions.timelineAxisFontSizeSelected}
                  fill='url(#selectedYearBackground)'
                />

                <text
                  x={0}
                  y={dimensions.timelineSteamgraphHeight +
                    dimensions.timelineAxisHeight - dimensions.timelineAxisShortTickHeight}
                  textAnchor='middle'
                  fill='#F0B67F'
                  style={{
                    fontSize: dimensions.timelineAxisFontSizeSelected,
                    fontWeight: 'bold'
                  }}
                >
                  {this.state.displayYear}
                </text>

                { (showPartyCounts) &&
                  <React.Fragment>
                    <text
                      x={(this.state.displayYear < 1932) ? timelineXTermSpan : timelineXTermSpan * -100}
                      y={this.state.demTextY}
                      textAnchor={(this.state.displayYear < 1932) ? 'start' : 'end'}
                      fill='white'
                    >
                      { this.state.demText }
                    </text>

                    <text
                      x={(this.state.displayYear < 1932) ? timelineXTermSpan : timelineXTermSpan * -10}
                      y={this.state.notDemTextY}
                      textAnchor={(this.state.displayYear < 1932) ? 'start' : 'end'}
                      fill='white'
                    >
                      { this.state.notDemText }
                    </text>
                  </React.Fragment>
                }

                { (districtCircleY && !this.state.dragging) &&
                  <circle
                    cx={0}
                    cy={districtCircleY}
                    r={7}
                    fill={districtCircleFill}
                    stroke='#F0B67F'
                  />
                }

                {/* clickable areas to select year */}
                { [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(congressOffset => (
                  <rect
                    x={timelineXTermSpan * (congressOffset - 0.5)}
                    y={0}
                    width={timelineXTermSpan}
                    height={dimensions.timelineHeight}
                    fill='transparent'
                    key={`clickbox${congressOffset}`}
                    id={selectedYear + congressOffset * 2}
                    onClick={this.onYearSelected}
                  />
                ))}

              </g>
            </svg>
          </div>
        </Draggable>
      </aside>
    );
  }
}

TimelineHandle.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  onYearSelected: PropTypes.func.isRequired,
  partyCounts: PropTypes.arrayOf(PropTypes.object).isRequired,
  showPartyCounts: PropTypes.bool.isRequired,
  districtCircleY: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.bool
  ]).isRequired,
  districtCircleFill: PropTypes.string,
  nationalDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  dimensions: PropTypes.shape({
    timelineWidth: PropTypes.number.isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineHorizontalGutter: PropTypes.number.isRequired,
    sidebarWidth: PropTypes.number.isRequired,
    timelineSteamgraphHeight: PropTypes.number.isRequired,
    timelineAxisLongTickHeight: PropTypes.number.isRequired,
    timelineAxisHeight: PropTypes.number.isRequired,
    timelineAxisShortTickHeight: PropTypes.number.isRequired,
    timelineAxisFontSizeSelected: PropTypes.number.isRequired
  }).isRequired,
  timelineXTermSpan: PropTypes.number.isRequired,
  timelineX: PropTypes.number.isRequired
};

TimelineHandle.defaultProps = {
  districtCircleFill: 'transparent'
};
