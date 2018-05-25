import * as React from 'react';
import PropTypes from 'prop-types';

const DistrictData = props => (
  <div
    id='sidebar'
    style={{
      width: props.dimensions.sidebarWidth,
      height: props.dimensions.sidebarHeight,
      left: props.dimensions.sidebarLeft,
      bottom: props.dimensions.sidebarBottom
    }}
    className='context'
  >
    { (props.label) &&
      <div
        className='districtLabel'
        style={{
          height: props.dimensions.districtLabelHeight,
          backgroundColor: props.backgroundColor
        }}
      >
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
                  strokeWidth={4}
                />
                <line
                  x1={props.dimensions.nextPreviousButtonHeight / -4}
                  x2={props.dimensions.nextPreviousButtonHeight / 4}
                  y1={0}
                  y2={0}
                  stroke='#233036'
                  strokeWidth={4}
                />
              </g>
            </svg>
          </button>
        }
      </div>
    }

    <div>
      <div>Victor: {props.victor}</div>
      {(props.party) &&
        <div>Party: {props.party}</div>
      }
    </div>
  </div>
);

export default DistrictData;

DistrictData.propTypes = {
  label: PropTypes.string.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  backgroundColor: PropTypes.string,
  victor: PropTypes.string.isRequired,
  party: PropTypes.string.isRequired,
  dimensions: PropTypes.shape({
    districtLabelLeft: PropTypes.number.isRequired,
    districtLabelBottom: PropTypes.number.isRequired,
    districtLabelHeight: PropTypes.number.isRequired,
    districtLabelWidth: PropTypes.number.isRequired,
    electionLabelFontSize: PropTypes.number.isRequired,
    nextPreviousButtonHeight: PropTypes.number.isRequired,
    nextPreviousButtonYOffset: PropTypes.number.isRequired,
    sidebarWidth: PropTypes.number.isRequired,
    sidebarHeight: PropTypes.number.isRequired,
    sidebarLeft: PropTypes.number.isRequired,
    sidebarBottom: PropTypes.number.isRequired
  }).isRequired
};

DistrictData.defaultProps = {
  backgroundColor: '#38444a'
};
