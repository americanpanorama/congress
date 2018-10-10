import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import App from './App';

require('../scss/main.scss');

Modal.setAppElement('#app-container');

ReactDOM.render(<App />, document.getElementById('app-container'));
