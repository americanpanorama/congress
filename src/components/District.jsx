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
      let duration = this.props.duration || 2000;

      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .ease(d3.easeSin)
        .duration(duration)
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
        stroke={ this.state.stroke }
        strokeWidth={ this.props.strokeWidth }
        strokeOpacity={ this.state.strokeOpacity }
        onClick={ this.props.onDistrictSelected }
        onMouseEnter={(this.props.onDistrictInspected) ? this.props.onDistrictInspected : () => false}
        onMouseOver={(this.props.onDistrictInspected) ? this.props.onDistrictInspected : () => false}
        
        onMouseLeave={(this.props.onDistrictInspected) ? this.props.onDistrictUninspected : () => false}
        id={this.props.id}
        style={{ pointerEvents: this.props.pointerEvents }}
        
      />
    );
  }
}