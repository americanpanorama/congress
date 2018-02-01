import * as React from 'react';

import ReactDOM from 'react-dom';
import * as d3 from "d3"
import DimensionsStore from '../stores/DimensionsStore.js';

export default class Bubble extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: this.props.r,
      color: this.props.color,
      stroke: this.props.stroke,
      cx: this.props.cx,
      cy: this.props.cy,
      windowDimensions: DimensionsStore.getMapDimensions()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.stroke !== nextProps.stroke || this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(1000)
        .ease(d3.easeSin)
          .attr('r', nextProps.r)
          .attr('transform', 'translate(' + nextProps.cx + ' ' + nextProps.cy + ')')
          .attr('cy', nextProps.cy)
          .style('fill', nextProps.color)
          .style('stroke', nextProps.stroke)
        .on('end', () => {
          this.setState({
            r: nextProps.r,
          });
        });

      d3.select(this.refs['bubble'])
        .transition()
        .duration(1000)
        .ease(d3.easeSin)
          .attr('r', nextProps.r)
          .style('fill', nextProps.color)
          .style('stroke', nextProps.stroke)
        .on('end', () => {
          this.setState({
            r: nextProps.r,
            stroke: nextProps.stroke
            //windowDimensions: DimensionsStore.getMapDimensions()
          });
        });
    }
  }

  render () {
    return (
      <g transform={'translate(' + this.state.cx + ' ' + this.state.cy + ')'}>
        <circle className='dorling'

          r={ this.state.r }
          fill={ this.state.color }
          style={ {
            // fillOpacity: (this.props.highlightedCities.length == 0) || this.props.highlightedCities.includes(this.props.city_id) ? 1 : 0.2,
            // strokeWidth: this.props.strokeWidth,
            // strokeOpacity: ((this.props.percentFamiliesOfColor >= this.props.pocSpan[0] && this.props.percentFamiliesOfColor <= this.props.pocSpan[1]) && (this.props.highlightedCities.length == 0 || this.props.highlightedCities.includes(this.props.city_id))) ? 1 : 0,
            stroke: this.state.stroke,
            strokeWidth: 0.33
          } }
          // onClick={ (this.props.hasProjectGeojson) ? this.props.onCityClicked : this.props.onCityClicked}
          // onMouseEnter={ this.props.onCityHover }
          // onMouseLeave={ this.props.onCityOut }
          id={ this.props.id }
          ref='bubble'
          className={ 'dorling ' + this.props.className }
        />

        { (this.props.label) ?
          <text
            x={ -3 }
            y={ 5 }
            fill='white'
            style={{ 
              fontSize: 12, 
              weight: 400,
              textShadow: '-1px 0 1px ' + this.props.labelColor + ', 0 1px 1px ' + this.props.labelColor + ', 1px 0 1px ' + this.props.labelColor + ', 0 -1px 1px ' + this.props.labelColor
            }}
          >
            { this.props.label }
          </text> : ''
        }
      </g>
    );
  }
}