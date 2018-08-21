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
          maxHeight: DimensionsStore.getDimensions().searchResultsHeight
        }}
      >
        {this.props.options.map(result => (
          <svg
            width={300}
            height={20}
            style={{ display: 'inline-block' }}
            onClick={this.props.onOptionSelected}
            id={result.id}
            key={`resultFor${result.id}`}
          >
            <text
              x={175 - 25 - 6 - 12}
              y={12}
              textAnchor='end'
              fill='white'
            >
              {result.victor}
            </text>
            <circle
              cx={175 - 25 - 6}
              cy={6}
              r={6}
              fill={getColorForParty(result.regularized_party_of_victory)}
            />
            <text
              x={175}
              y={12}
              textAnchor='start'
              fill='white'
            >
              {` ${result.stateAbbr} ${result.district}`}
            </text>
          </svg>
        ))}
      </div>
    );
  }
};

SearchResult.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onOptionSelected: PropTypes.func.isRequired
};
