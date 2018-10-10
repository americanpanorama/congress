import * as React from 'react';
import PropTypes from 'prop-types';

const Masthead = props => (
  <header
    style={{
      height: props.dimensions.headerHeight,
      width: props.dimensions.mapWidth,
      margin: props.dimensions.gutterPadding
    }}
  >
    <h1
      style={{
        fontSize: props.dimensions.headerTitleFontSize,
        marginTop: props.dimensions.headerGutter,
        display: 'inline-block',
        marginRight: '20px'
      }}
    >
      Electing the House of Representatives
    </h1>
    <h2
      style={{
        fontSize: props.dimensions.headerTitleFontSize * 0.5,
        marginTop: props.dimensions.headerGutter,
        display: 'inline-block',
        transform: `translateY(${props.dimensions.headerTitleFontSize * -0.15}px)`
      }}
    >
      1840-2016
    </h2>
  </header>
);

export default Masthead;

Masthead.propTypes = {
  dimensions: PropTypes.shape({
    headerHeight: PropTypes.number,
    mapWidth: PropTypes.number,
    gutterPadding: PropTypes.number,
    headerTitleFontSize: PropTypes.number,
    headerGutter: PropTypes.number
  }).isRequired
};
