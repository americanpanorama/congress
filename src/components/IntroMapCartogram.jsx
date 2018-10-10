import * as React from 'react';

import Bubble from './Bubble';
import BubbleCity from './BubbleCity';
import District from './District';

import IntroData from '../../data/introMapCartogram.json';

export default class IntroMapCartogram extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      selectedView: 'map'
    };

    this.changeFirstImage = this.changeFirstImage.bind(this);
  }

  componentDidMount () {
    this.timeout = setTimeout(this.changeFirstImage, 3000);
  }

  componentWillUnmount () {
    clearTimeout(this.timeout);
  }

  changeFirstImage () {
    const newValue = (this.state.selectedView === 'cartogram') ? 'map' : 'cartogram'
    this.setState({
      selectedView: newValue
    }, () => {
      this.timeout = setTimeout(this.changeFirstImage, 5000);
    });
  }

  render () {
    return (
      <svg
        width={140}
        height={120}
      >
        <g
          transform='translate(-90 -80) scale(800)'
        >
          {/* district polygons */}
          { IntroData.elections.map(d => (
            <District
              d={d.svg}
              id={d.id}
              onDistrictSelected={() => false}
              duration={2000}
              fill={(d.partyReg === 'republican') ? '#FB6765' : '#717EFF'}
              stroke='white'
              fillOpacity={(this.state.selectedView === 'cartogram') ? 0.1 : 1}
              strokeOpacity={(this.state.selectedView === 'cartogram') ? 0 : 0.5}
              strokeWidth={0.001}
              pointerEvents='none'
              key={`polygonIntro${d.id}`}
            />
          ))}

          {/* city bubbles */} { IntroData.cityBubbles.map((d, i) => (
            <BubbleCity
              cx={(this.state.selectedView === 'cartogram') ? d.x : d.xOrigin}
              cy={(this.state.selectedView === 'cartogram') ? d.y : d.yOrigin}
              r={(this.state.selectedView === 'cartogram') ? d.r : 4.8 / 800}
              duration={2000}
              fillOpacity={(this.state.selectedView === 'cartogram') ? 0.5 : 0}
              cityLabel=''
              cityLabelOpacity={0}
              key={d.id}
            />
          ))}

          {/* district bubbles */}
          { IntroData.elections.map(d => (
            <Bubble
              cx={(this.state.selectedView === 'cartogram') ? d.x : d.xOrigin}
              cy={(this.state.selectedView === 'cartogram') ? d.y : d.yOrigin}
              r={4.8 / 800}
              label=''
              labelColor='white'
              duration={2000}
              id={d.id}
              onDistrictSelected={() => false}
              fill={(d.partyReg === 'republican') ? '#FB6765' : '#717EFF'}
              fillOpacity={(this.state.selectedView === 'cartogram') ? 1 : 0}
              stroke='transparent'
              strokeWidth={0}
              key={`bubble-${d.id}`}
            />
          ))}
        </g>
      </svg>
    );
  }
}
