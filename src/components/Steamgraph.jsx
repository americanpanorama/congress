import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

const Steamgraph = (props) => {
  const stackColor = {
    demAboveMargin: getColorForParty('democrat'),
    demBelowMargin: getColorForMargin('democrat', 0.7),
    thirdCount: getColorForParty('third'),
    repBelowMargin: getColorForMargin('republican', 0.7),
    repAboveMargin: getColorForParty('republican'),
    whigBelowMargin: getColorForMargin('whig', 0.7),
    whigAboveMargin: getColorForParty('whig')
  };

  return (
    <React.Fragment>
      {props.steamgraphPaths.map((steamgraphPath, i) => (
        <path
          d={steamgraphPath.d}
          fill={stackColor[steamgraphPath.party]}
          key={`timelineParty-${steamgraphPath.party}-${steamgraphPath.firstYear}`}
          stroke={getColorForMargin('democrat', 0.5)}
          strokeWidth={1}
          strokeOpacity={0}
        />
      ))}
    </React.Fragment>
  );
};

export default Steamgraph;

Steamgraph.propTypes = {
  steamgraphPaths: PropTypes.arrayOf(PropTypes.object).isRequired
};
