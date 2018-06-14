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
            fontSize: props.dimensions.electionLabelFontSize,
            paddingRight: props.dimensions.nextPreviousButtonHeight
          }}
        >
          {props.label}
        </h2>

        { props.previousDistrict &&
          <button
            onClick={props.onDistrictSelected}
            id={props.previousDistrict}
            style={{
              left: props.dimensions.nextPreviousButtonHeight / 2 - 1,
              top: props.dimensions.nextPreviousButtonHeight / 2 - 1
            }}
          >
            <svg
              width={props.dimensions.nextPreviousButtonHeight + 2}
              height={props.dimensions.nextPreviousButtonHeight + 2}
            >
              <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2 + 1} ${props.dimensions.nextPreviousButtonHeight / 2 + 1}) rotate(315)`}>
                <circle
                  cx={0}
                  cy={0}
                  r={props.dimensions.nextPreviousButtonHeight / 2}
                  fill='silver'
                  fillOpacity={1}
                  stroke='#38444a'
                  strokeWidth={1}
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

        { props.nextDistrict &&
          <button
            onClick={props.onDistrictSelected}
            id={props.nextDistrict}
            style={{
              right: props.dimensions.nextPreviousButtonHeight * 1.75 - 1,
              top: props.dimensions.nextPreviousButtonHeight / 2 - 1
            }}
          >
            <svg
              width={props.dimensions.nextPreviousButtonHeight + 2}
              height={props.dimensions.nextPreviousButtonHeight + 2}
            >
              <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2 + 1} ${props.dimensions.nextPreviousButtonHeight / 2 + 1}) rotate(135)`}>
                <circle
                  cx={0}
                  cy={0}
                  r={props.dimensions.nextPreviousButtonHeight / 2}
                  fill='silver'
                  fillOpacity={1}
                  stroke='#38444a'
                  strokeWidth={1}
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

        { (props.isSelected) &&
          <button
            onClick={props.onDistrictSelected}
            style={{
              right: props.dimensions.nextPreviousButtonHeight / 2 - 1,
              top: props.dimensions.nextPreviousButtonHeight / 2 - 1
            }}
          >
            <svg
              width={props.dimensions.nextPreviousButtonHeight + 2}
              height={props.dimensions.nextPreviousButtonHeight + 2}
            >
              <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2 + 1} ${props.dimensions.nextPreviousButtonHeight / 2 + 1}) rotate(135)`}>
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

    <ul className='districtData'>
      <li>
        <div className='label'>Won by</div>
        <div className='data'>{props.victor}</div>
      </li>

      {(props.party) &&
        <li>
          <div className='label'>Party</div>
          <div className='data'>{props.party}</div>
        </li>
      }
    </ul>
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
  previousDistrict: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  nextDistrict: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
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