import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import DimensionsStore from '../stores/DimensionsStore.js';

const PanNav = (props) => {
  const projectWidth = (window.innerWidth - 40 * (props.nav_data.length)) / (props.nav_data.length);

  return (
    <div className='pannav'>
      { (!props.show_menu) &&
        <div
          id='hamburger'
          style={{
            position: 'fixed',
            top: 20,
            left: 30
          }}
        >
          <img
            src='//dsl.richmond.edu/panorama/static/images/hamburger.png'
            onClick={props.toggle}
          />
        </div>
      }

      <Modal
        isOpen={props.show_menu}
        onRequestClose={props.toggle}
        className='nav_header'
        style={props.style}
        contentLabel='pannav'
      >
        
        <div id='nav_header'>
          <div id='navburger'>
            <img
              src='//dsl.richmond.edu/panorama/static/images/menu-close.svg'
              onClick={props.toggle}
              style={{ pointer: 'cursor' }}
            />
          </div>

          <h1>
            <a href='http://dsl.richmond.edu/panorama'>
              American Panorama
            </a>
          </h1>
          <h2>
            <a href='//dsl.richmond.edu' target='_blank'>Digital Scholarship Lab</a>,
            <a href='//www.richmond.edu' target='_blank'>University of Richmond</a>
          </h2>

          <div id='maps'>
            { props.nav_data.map((item, i) => (
              <div
                className='pan_nav_item'
                key={`pan_nav_item_${i}`}
                style={{ width: projectWidth }}
              >
                <a href={item.url}>
                  <img
                    src={item.screenshot}
                    style={{ width: projectWidth  }}
                  />
                </a>
                <br />
                <h4>
                  <a href={item.url}>{item.title}</a>
                </h4>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PanNav;

PanNav.propTypes = {
  nav_data: PropTypes.arrayOf(PropTypes.object).isRequired,
  show_menu: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  style: PropTypes.shape({
    overlay: PropTypes.object,
    content: PropTypes.object
  })
};

PanNav.defaultProps = {
  show_menu: false,
  style: {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    content: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 'auto',
      right: 'auto',
      border: 0,
      background: 'rgba(0,0,0,0.5)',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '4px',
      outline: 'none',
      padding: 0
    }
  }
};
