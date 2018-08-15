import * as React from 'react';
import PropTypes from 'prop-types';

const ElectionLabel = props => (
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
      American Democracy's Landscape
    </h1>
    <h2
      style={{
        fontSize: props.dimensions.headerSubtitleFontSize,
        marginTop: props.dimensions.headerGutter
      }}
    >
      Electing the House of Representatives
    </h2>
    <nav>
      <h4 onClick={props.onModalClick} id='intro'>Introduction</h4>
      <h4 onClick={props.onModalClick} id='sources'>Sources & Method</h4>
      <h4 onClick={props.onModalClick} id='citing'>Citing</h4>
      <h4 onClick={props.onModalClick} id='about'>About</h4>
      <h4 onClick={props.onContactUsToggle}>Contact Us</h4>
    </nav>
  </header>
);

export default ElectionLabel;

ElectionLabel.propTypes = {
  dimensions: PropTypes.object.isRequired,
  onModalClick: PropTypes.func.isRequired,
  onContactUsToggle: PropTypes.func.isRequired
};
