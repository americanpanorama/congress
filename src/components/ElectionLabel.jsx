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
    <button
      onClick={(props.previousYear) ? props.onYearSelected : () => false}
      id={props.previousYear}
      style={{
        marginTop: props.dimensions.nextPreviousButtonHeight / 2
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
    <h2
      style={{
        fontSize: props.dimensions.electionLabelFontSize
      }}
    >
      {`Election of ${props.selectedYear}: The ${ordinalSuffixOf(congressForYear(props.selectedYear))} Congress`}
    </h2>
    <button
      onClick={(props.nextYear) ? props.onYearSelected : () => false}
      id={props.nextYear}
      style={{
        marginTop: props.dimensions.nextPreviousButtonHeight / 2
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
  </div>
);

export default ElectionLabel;

ElectionLabel.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  previousYear: PropTypes.number.isRequired,
  nextYear: PropTypes.number.isRequired,
  onYearSelected: PropTypes.func.isRequired,
  dimensions: PropTypes.shape({
    electionLabelLeft: PropTypes.number.isRequired,
    electionLabelBottom: PropTypes.number.isRequired,
    electionLabelHeight: PropTypes.number.isRequired,
    electionLabelWidth: PropTypes.number.isRequired,
    electionLabelFontSize: PropTypes.number.isRequired,
    nextPreviousButtonHeight: PropTypes.number.isRequired
  }).isRequired
};
