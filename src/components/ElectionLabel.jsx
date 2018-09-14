import * as React from 'react';
import PropTypes from 'prop-types';
import { congressForYear, ordinalSuffixOf } from '../utils/HelperFunctions';

const ElectionLabel = props => (
  <div
    id='electionLabel'
    style={{
      width: props.dimensions.electionLabelWidth,
      height: props.dimensions.electionLabelHeight,
      left: props.dimensions.electionLabelLeft,
      bottom: props.dimensions.electionLabelBottom
    }}
  >
    { (props.previousYear) &&
      <button
        onClick={(props.previousYear) ? props.onYearSelected : () => false}
        id={props.previousYear}
        style={{
          left: props.dimensions.nextPreviousButtonHeight / 2 - 1,
          top: props.dimensions.nextPreviousButtonHeight / 2 - 1
        }}
      >
        <svg
          width={props.dimensions.nextPreviousButtonHeight}
          height={props.dimensions.nextPreviousButtonHeight}
        >
          <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2} ${props.dimensions.nextPreviousButtonHeight / 2}) rotate(315)`}>
            <circle
              cx={0}
              cy={0}
              r={props.dimensions.nextPreviousButtonHeight / 2}
              fill='silver'
              fillOpacity={1}
            />
            <path
              d={`M${props.dimensions.nextPreviousButtonHeight / -8},${props.dimensions.nextPreviousButtonHeight / 4} V${props.dimensions.nextPreviousButtonHeight / -8} H${props.dimensions.nextPreviousButtonHeight / 4}`}
              fill='transparent'
              stroke='#233036'
              strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
            />
          </g>
        </svg>
      </button>
    }

    <h2
      onClick={props.onToggleSearch}
      style={{
        fontSize: props.dimensions.electionLabelFontSize
      }}
    >
      {`Election of ${props.selectedYear}`}
      <span style={{ fontWeight: 100, marginLeft: 10 }}>
        {`The ${ordinalSuffixOf(congressForYear(props.selectedYear))} Congress`}
      </span>
    </h2>

    { (props.nextYear) &&
      <button
        onClick={(props.nextYear) ? props.onYearSelected : () => false}
        id={props.nextYear}
        style={{
          right: props.dimensions.nextPreviousButtonHeight / 2 - 1,
          top: props.dimensions.nextPreviousButtonHeight / 2 - 1
        }}
      >
        <svg
          width={props.dimensions.nextPreviousButtonHeight + 2}
          height={props.dimensions.nextPreviousButtonHeight + 2}
        >
          <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2} ${props.dimensions.nextPreviousButtonHeight / 2}) rotate(135)`}>
            <circle
              cx={0}
              cy={0}
              r={props.dimensions.nextPreviousButtonHeight / 2}
              fill='silver'
              fillOpacity={1}
            />
            <path
              d={`M${props.dimensions.nextPreviousButtonHeight / -8},${props.dimensions.nextPreviousButtonHeight / 4} V${props.dimensions.nextPreviousButtonHeight / -8} H${props.dimensions.nextPreviousButtonHeight / 4}`}
              fill='transparent'
              stroke='#233036'
              strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
            />
          </g>
        </svg>
      </button>
    }

    <button
      onClick={props.onToggleSearch}
      style={{
        marginTop: props.dimensions.nextPreviousButtonHeight / 2
      }}
    >
      <svg
        width={props.dimensions.nextPreviousButtonHeight + 2}
        height={props.dimensions.nextPreviousButtonHeight + 2}
      >
        <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2} ${props.dimensions.nextPreviousButtonHeight / 2}) rotate(315)`}>
          <circle
            cx={0}
            cy={0}
            r={props.dimensions.nextPreviousButtonHeight / 2}
            fill='silver'
            fillOpacity={1}
          />
          <circle
            cx={0}
            cy={props.dimensions.nextPreviousButtonHeight * -0.1}
            r={props.dimensions.nextPreviousButtonHeight * 0.2}
            fill='silver'
            fillOpacity={1}
            stroke='#233036'
            strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
          />
          <line
            x1={0}
            x2={0}
            y1={props.dimensions.nextPreviousButtonHeight * 0.1}
            y2={props.dimensions.nextPreviousButtonHeight * 0.4}
            stroke='#233036'
            strokeWidth={props.dimensions.nextPreviousButtonHeight / 8}
          />
        </g>
      </svg>
    </button>
  </div>
);

export default ElectionLabel;

ElectionLabel.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  previousYear: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.bool
  ]).isRequired,
  nextYear: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.bool
  ]).isRequired,
  onYearSelected: PropTypes.func.isRequired,
  onToggleSearch: PropTypes.func.isRequired,
  dimensions: PropTypes.shape({
    electionLabelLeft: PropTypes.number.isRequired,
    electionLabelBottom: PropTypes.number.isRequired,
    electionLabelHeight: PropTypes.number.isRequired,
    electionLabelWidth: PropTypes.number.isRequired,
    electionLabelFontSize: PropTypes.number.isRequired,
    nextPreviousButtonHeight: PropTypes.number.isRequired
  }).isRequired
};
