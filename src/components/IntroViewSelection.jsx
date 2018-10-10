import * as React from 'react';

import District from './District';

import IntroData from '../../data/introSelectedView.json';

export default class Map extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      selectedParty: 'democrat'
    };

    this.changeImage = this.changeImage.bind(this);
  }

  componentDidMount () {
    this.timeout = setTimeout(this.changeImage, 2000);
  }

  componentWillUnmount () {
    clearTimeout(this.timeout);
  }
  
  changeImage () {
    const newValue = (this.state.selectedParty === 'democrat') ? 'republican' : 'democrat';
    this.setState({
      selectedParty: newValue
    }, () => {
      this.timeout = setTimeout(this.changeImage, 4000);
    });
  }

  render () {
    return (
      <svg
        width={250}
        height={80}
      >
        <g
          transform='translate(-50 -25) scale(1200)'
        >
          {/* district polygons */}
          { IntroData.map(d => (
            <District
              d={d.svg}
              id={d.id}
              onDistrictSelected={() => false}
              duration={2000}
              fill={(d.partyReg === 'republican') ? '#FB6765' : '#717EFF'}
              stroke='white'
              fillOpacity={(this.state.selectedParty !== d.partyReg) ? 0.1 : 1}
              strokeOpacity={(this.state.selectedParty !== d.partyReg) ? 0.1 : 0.5}
              strokeWidth={0.001}
              pointerEvents='none'
              key={`polygonIntro${d.id}`}
            />
          ))}
        </g>
      </svg>
    );
  }
}
