import React from 'react';
import PropTypes from 'prop-types';

export default class ContactUs extends React.Component {
  handleSubmit (evt) {
    evt.preventDefault();

    var xhr = new XMLHttpRequest(),
      params = [
        encodeURIComponent('Form_ID') + '=' + encodeURIComponent('congress_contact_us'),
        encodeURIComponent('Owner_ID') + '=' + encodeURIComponent('rnelson2'),
        encodeURIComponent('send_submit') + '=' + encodeURIComponent('data'),
        encodeURIComponent('send_submit_to') + '=' + encodeURIComponent('rnelson2'),
        encodeURIComponent('project') + '=' + encodeURIComponent('renewal_contact_form'),
        encodeURIComponent('name') + '=' + encodeURIComponent(evt.target.name.value),
        encodeURIComponent('email') + '=' + encodeURIComponent(evt.target.email.value),
        encodeURIComponent('message') + '=' + encodeURIComponent(evt.target.message.value)
      ].join('&');

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        document.getElementsByClassName("content")[0].innerHTML = "<p>We have received your message. Thank you for contacting us.</p>";
      }
    };

    xhr.open("POST", 'https://webapps.richmond.edu/URPoster/URPoster.php');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);


    return false;
  }

  render () {
    const { dimensions } = this.props;

    return (
      <div
        className='longishform contactUs'
        style={dimensions.textAreaStyle}
      >
        <button
          className='close'
          onClick={this.props.close}
          style={{
            top: dimensions.textCloseTop,
            right: dimensions.textCloseRight
          }}
        >
          <svg
            width={dimensions.nextPreviousButtonHeight + 2}
            height={dimensions.nextPreviousButtonHeight + 2}
          >
            <g transform={`translate(${dimensions.nextPreviousButtonHeight / 2 + 1} ${dimensions.nextPreviousButtonHeight / 2 + 1}) rotate(135)`}>
              <circle
                cx={0}
                cy={0}
                r={dimensions.nextPreviousButtonHeight / 2}
                fill='silver'
                stroke='#38444a'
                strokeWidth={1}
              />
              <line
                x1={0}
                x2={0}
                y1={dimensions.nextPreviousButtonHeight / 4}
                y2={dimensions.nextPreviousButtonHeight / -4}
                stroke='#233036'
                strokeWidth={dimensions.nextPreviousButtonHeight / 10}
              />
              <line
                x1={dimensions.nextPreviousButtonHeight / -4}
                x2={dimensions.nextPreviousButtonHeight / 4}
                y1={0}
                y2={0}
                stroke='#233036'
                strokeWidth={dimensions.nextPreviousButtonHeight / 10}
              />
            </g>
          </svg>
        </button>

        <div className='content'>
          <h2>Contact Us</h2>
          <p>We very much welcome feedback, comments, and suggestions.</p>
          <form name='redlining_contact_us' onSubmit={this.handleSubmit}>
            <label htmlFor='name'>Name</label>
            <input type='text' maxLength={50} name='name' />
            <label htmlFor='email'>Email</label>
            <input type='text' maxLength={50} name='email' />
            <label htmlFor='email'>Message</label>
            <textarea name="message" cols={60} />
            <input type="submit" />
          </form>
        </div>
      </div>
    );
  }
}

ContactUs.propTypes = {
  close: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired
};
