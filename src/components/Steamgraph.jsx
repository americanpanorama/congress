import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

const Steamgraph = (props) => {
  const x = d3.scaleLinear()
    .domain([1824, 2016])
    .range([15, props.width]);
  const area = d3.area()
    .x(d => x(d.data.year))
    .y0(d => props.y(d[0]))
    .y1(d => props.y(d[1]))
    .curve(d3.curveCatmullRom);
  const stackColor = {
    demAboveMargin: getColorForParty('democrat'),
    demBelowMargin: getColorForMargin('democrat', 0.8),
    thirdCount: getColorForParty('third'),
    repBelowMargin: getColorForMargin('republican', 0.8),
    repAboveMargin: getColorForParty('republican'),
    whigBelowMargin: getColorForMargin('whig', 0.8),
    whigAboveMargin: getColorForParty('whig')
  };

  return (
    <React.Fragment>
      {props.partyCount.map((partyCount, i) => (
        <path
          d={area(partyCount)}
          fill={stackColor[props.partyCountKeys[i]]}
          key={`timelineParty-${props.partyCountKeys[i]}-${partyCount[0].data.year}`}
          stroke={getColorForMargin('democrat', 0.5)}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ))}
    </React.Fragment>
  );
};

export default Steamgraph;

Steamgraph.propTypes = {
  partyCount: PropTypes.arrayOf(PropTypes.array).isRequired,
  partyCountKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  y: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};
