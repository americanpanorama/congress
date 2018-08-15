import * as React from 'react';
import PropTypes from 'prop-types';

import GeneralTicketElection from './GeneralTicketElection';

import { getDistrictStyleFromUi, getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

const StateGeneralTicket = (props) => {
  const cols = Math.ceil(Math.sqrt(props.elections.length));
  const offset = cols / 2 * props.length;

  return (
    <g>
      <path
        d={props.d}
        fill='white'
        fillOpacity={0.1}
        stroke='#eee'
        strokeWidth={2}
      />
      <g className='generalticket' transform={`translate(${props.centroid[0] - offset} ${props.centroid[1] - offset})`}>
        { props.elections.map((election, i) => (
          <GeneralTicketElection
            key={`${election.id}-${i}`}
            x={i % cols * props.length}
            y={Math.floor(i / cols) * props.length}
            length={props.length}
            id={election.id}
            onDistrictSelected={props.onDistrictSelected}
            {...getDistrictStyleFromUi(election, props.uiState)}
          />

        ))}
      </g>
    </g>
  );
};

export default StateGeneralTicket;

StateGeneralTicket.propTypes = {
  uiState: PropTypes.shape({
    selectedView: PropTypes.string.isRequired,
    winnerView: PropTypes.bool.isRequired,
    selectedYear: PropTypes.number.isRequired,
    selectedParty: PropTypes.string,
    onlyFlipped: PropTypes.bool,
    inspectedDistrict: PropTypes.string,
    zoom: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number
  }).isRequired,
  centroid: PropTypes.arrayOf(PropTypes.number).isRequired,
  elections: PropTypes.arrayOf(PropTypes.object),
  length: PropTypes.number.isRequired,
  onDistrictSelected: PropTypes.func.isRequired
};

StateGeneralTicket.defaultProps = {
  elections: []
};
