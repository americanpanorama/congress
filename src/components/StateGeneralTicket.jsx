import * as React from 'react';
import PropTypes from 'prop-types';

import GeneralTicketElection from './GeneralTicketElection';

import { getDistrictStyleFromUi } from '../utils/HelperFunctions';

const StateGeneralTicket = (props) => {
  const cols = Math.ceil(Math.sqrt(props.elections.length));
  const offset = cols / 2 * props.length;

  return (
    <g className='generalticket' transform={`translate(${props.elections[0].xOrigin - offset} ${props.elections[0].yOrigin - offset})`}>
      { props.elections.map((election, i) => (
        <GeneralTicketElection
          key={election.id}
          x={i % cols * props.length}
          y={Math.floor(i / cols) * props.length}
          length={props.length}
          id={election.spatialId}
          duration={props.duration}
          onDistrictSelected={props.onDistrictSelected}
          {...getDistrictStyleFromUi(election, props.uiState)}
        />

      ))}
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
  elections: PropTypes.arrayOf(PropTypes.object),
  length: PropTypes.number.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  duration: PropTypes.number
};

StateGeneralTicket.defaultProps = {
  elections: [],
  duration: 0
};
