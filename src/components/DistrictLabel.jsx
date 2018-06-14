import * as React from 'react';
import PropTypes from 'prop-types';

const DistrictLabel = props => (
  <div
    id='districtLabel'
    style={{
      width: props.dimensions.districtLabelWidth,
      height: props.dimensions.districtLabelHeight,
      left: props.dimensions.districtLabelLeft,
      bottom: props.dimensions.districtLabelBottom,
      backgroundColor: props.backgroundColor
    }}
  >
    { (props.label) &&
      <div>
        <h2
          style={{
            fontSize: props.dimensions.electionLabelFontSize 
          }}
        >
          {props.label}
        </h2>
        { (props.isSelected) &&
          <button
            onClick={props.onDistrictSelected}
          >
            <svg
              width={props.dimensions.nextPreviousButtonHeight + 2}
              height={props.dimensions.nextPreviousButtonHeight +
                props.dimensions.nextPreviousButtonYOffset + 2}
            >
              <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2} ${props.dimensions.nextPreviousButtonHeight / 2 + props.dimensions.nextPreviousButtonYOffset}) rotate(135)`}>
                <circle
                  cx={0}
                  cy={0}
                  r={props.dimensions.nextPreviousButtonHeight / 2}
                  fill='silver'
                  stroke='#38444a'
                  strokeWidth={1}
                />
                <line
                  x1={0}
                  x2={0}
                  y1={props.dimensions.nextPreviousButtonHeight / 4}
                  y2={props.dimensions.nextPreviousButtonHeight / -4}
                  stroke='#233036'
                  strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
                />
                <line
                  x1={props.dimensions.nextPreviousButtonHeight / -4}
                  x2={props.dimensions.nextPreviousButtonHeight / 4}
                  y1={0}
                  y2={0}
                  stroke='#233036'
                  strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
                />
              </g>
            </svg>
          </button>
        }
      </div>
    }
  </div>
);

export default DistrictLabel;

DistrictLabel.propTypes = {
  label: PropTypes.string.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  backgroundColor: PropTypes.string,
  dimensions: PropTypes.shape({
    districtLabelLeft: PropTypes.number.isRequired,
    districtLabelBottom: PropTypes.number.isRequired,
    districtLabelHeight: PropTypes.number.isRequired,
    districtLabelWidth: PropTypes.number.isRequired,
    electionLabelFontSize: PropTypes.number.isRequired,
    nextPreviousButtonHeight: PropTypes.number.isRequired,
    nextPreviousButtonYOffset: PropTypes.number.isRequired
  }).isRequired
};

DistrictLabel.defaultProps = {
  backgroundColor: '#38444a'
};
