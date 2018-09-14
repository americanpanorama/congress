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
        marginTop: props.dimensions.headerGutter
      }}
    >
      Electing the House of Representatives
    </h1>
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
