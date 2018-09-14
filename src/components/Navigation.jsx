import * as React from 'react';
import PropTypes from 'prop-types';

const Navigation = props => (
  <nav id='mainNav' style={props.dimensions.navStyle}>
    <h4 onClick={props.onModalClick} id='intro'>Introduction</h4>
    <h4 onClick={props.onModalClick} id='sources'>Sources & Method</h4>
    <h4 onClick={props.onModalClick} id='citing'>Citing</h4>
    <h4 onClick={props.onModalClick} id='about'>About</h4>
    <h4 onClick={props.onContactUsToggle}>Contact Us</h4>
  </nav>
);

export default Navigation;

Navigation.propTypes = {
  dimensions: PropTypes.object.isRequired,
  onModalClick: PropTypes.func.isRequired,
  onContactUsToggle: PropTypes.func.isRequired
};
