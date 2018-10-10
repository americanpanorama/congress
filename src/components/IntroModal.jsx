import React from 'react';
import PropTypes from 'prop-types';

import IntroMapCartogram from './IntroMapCartogram';
import IntroViewSelection from './IntroViewSelection';

export default class IntroModal extends React.Component {

  constructor (props) {
    super(props);

    this.dismissIntro = this.dismissIntro.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      pageIndex: 0,
      dismissedChecked: false
    };

    this.muteIntroInput = React.createRef();
    this.muteIntroLabel = React.createRef();
  }

  componentWillMount () {
    const img = new Image();
    const onload = (event) => {
      img.removeEventListener('load', onload);
      this.setState({
        coverImgLoaded: true
      });
    };

    img.addEventListener('load', onload);
    img.src = IntroModal.coverImgPath;
  }

  setPage (pi) {
    const pageIndex = Math.max(0, Math.min(pi, 1));
    this.setState({
      pageIndex: pageIndex
    });
  }

  dismissIntro () {
    this.props.onDismiss(this.muteIntroInput.current.checked);
  }

  handleInputChange () {
    this.setState({
      dismissedChecked: !this.state.dismissedChecked
    });
  }

  render () {
    if (this.state.pageIndex === 0) {
      return (
        <div className='intro-modal'>
          <div className='page p0'>
            <div className='title-block'>
              <h3>Electing the</h3>
              <h1>House of Representatives</h1>
            </div>
            <img src={'./static/introImgs/whig.jpg'} className={ this.state.coverImgLoaded ? '' : 'loading' } />
            <p>The most democratic body in the federal government, hundreds of representatives for the House are elected every other year. This site maps elections from before the Civil War until today showing changing patterns across regions and between urban and rural areas.</p>
            <div className='intro-modal-button' onClick={ () => this.setPage(1) }>Next</div>
          </div>
        </div>
      );
    }
    return (
      <div className='intro-modal'>
        <div className='page p1'>
          <div className='title-block'>
            <h3>how to use</h3>
            <h2>this map</h2>
          </div>
          <div className='content'>
            <ol>
              <li>
                <div className='ordinal'>1</div>
                <div className='item' style={{ transform: 'translateY(30px)' }}>
                  <p className='no-margin'>Toggle between two visualizations. The map shows the shape, size, and winner of each district. The cartogram shows smaller districts and difference between urban and rural areas by representing each as a bubble.</p>
                  <div className='viz'><IntroMapCartogram /></div>
                </div>
              </li>
              <li className='wider'>
                <div className='ordinal'>2</div>
                <div className='item'>
                  <p>Use the legend to toggle turn parties and flipped districts on and off.</p>
                  <div className='viz'><IntroViewSelection /></div>
                </div>
              </li>
              <li>
                <div className='ordinal descender'>3</div>
                <div className='item'>
                  <p className='no-margin'>The timeline shows the changing strength of political parties over time and can be used to change the election year.</p>
                  <div className='viz'>
                    <object data='./static/introImgs/num3Timeline.svg' type="image/svg+xml" />
                  </div>
                </div>
              </li>
              <li className='wider'>
                <div className='ordinal descender'>4</div>
                <div className='item'>
                  <p>Click on a district to see more detail about that election and how that place voted over time.</p>
                  <div className='viz'>
                    <object data='./static/introImgs/num4Selected.svg' type="image/svg+xml" />
                  </div>
                </div>
              </li>
            </ol>
          </div>
          <div className='intro-modal-button' onClick={ this.dismissIntro }>Enter</div>
          <div className='footer'>
            <div onClick={ () => this.setPage(0) }>&lt; back</div>
            <label
              onChange={this.handleInputChange}
              ref={this.muteIntroLabel}
              className={(this.state.dismissedChecked) ? 'checked' : ''}
            >
              <input
                type='checkbox'
                ref={this.muteIntroInput}
              />
              do not show again
            </label>
          </div>
        </div>
      </div>
    );
  }
}

IntroModal.propTypes = {
  onDismiss: PropTypes.func.isRequired
};
