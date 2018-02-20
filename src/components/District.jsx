import * as React from 'react';

import ReactDOM from 'react-dom';
import * as d3 from "d3"
import DimensionsStore from '../stores/DimensionsStore.js';

export default class District extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      color: this.props.fill,
      stroke: this.props.stroke,
      fillOpacity: this.props.fillOpacity,
      strokeOpacity: this.props.strokeOpacity,
      windowDimensions: DimensionsStore.getMapDimensions()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fill !== nextProps.fill || this.props.stroke !== this.props.stroke || this.props.fillOpacity !== nextProps.fillOpacity || this.props.strokeOpacity !== nextProps.strokeOpacity ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .ease(d3.easeSin)
        .duration(1000)
        .style('fill', nextProps.fill)
        .style('stroke', nextProps.stroke)
        .style('fill-opacity', nextProps.fillOpacity)
        .style('stroke-opacity', nextProps.strokeOpacity)
        .on('end', () => {
          this.setState({
            fill: nextProps.fill,
            fillOpacity: nextProps.fillOpacity,
            strokeOpacity: nextProps.strokeOpacity,
            //windowDimensions: DimensionsStore.getMapDimensions()
          });
        });
    }
  }

  render () {
    return (
      <path
        d={ this.props.d }
        fill={ this.state.color }
        fillOpacity={ this.state.fillOpacity }
        stroke={ this.state.color || this.state.stroke }
        strokeWidth={ 0.5 }
        strokeOpacity={ this.state.strokeOpacity }
      />
    );
  }
}