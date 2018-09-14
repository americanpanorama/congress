import * as React from 'react';
import PropTypes from 'prop-types';

import DimensionsStore from '../stores/DimensionsStore';

import { getColorForParty } from '../utils/HelperFunctions';

export default class SearchResult extends React.Component {
  render () {
    return (
      <div 
        id='searchResults'
        style={{
          height: DimensionsStore.getDimensions().timelineHeight - 20
        }}
      >
        {this.props.options.map(result => (
          <div
            onClick={this.props.onOptionSelected}
            id={result.spatialId}
            key={`resultFor${result.id}`}
          >
            <span className='victor'>{result.victor}</span>

            <span
              className='partyDot'
              style={{
                backgroundColor: getColorForParty(result.partyReg),
              }}
            />
            {` ${result.stateAbbr} ${result.district}`}
          </div>
        ))}
      </div>
    );
  }
};

SearchResult.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onOptionSelected: PropTypes.func.isRequired
};
