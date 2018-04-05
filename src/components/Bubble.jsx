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
      dCityLabel: DimensionsStore.getTitleLabelArc(this.props.r),
      windowDimensions: DimensionsStore.getMapDimensions()
    };
  }

  componentWillReceiveProps(nextProps) {
    function pathTween(d1, precision) {
      return function() {
        var path0 = this,
            path1 = path0.cloneNode(),
            n0 = path0.getTotalLength(),
            n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

        // Uniform sampling of distance based on specified precision.
        var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
        while ((i += dt) < 1) distances.push(i);
        distances.push(1);

        // Compute point-interpolators at each distance.
        var points = distances.map(function(t) {
          var p0 = path0.getPointAtLength(t * n0),
              p1 = path1.getPointAtLength(t * n1);
          return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
        });

        return function(t) {
          return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
        };
      };
    }

    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color || this.props.stroke !== nextProps.stroke || this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy ) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(2000)
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

      let delay = (nextProps == 0.01) ? 0 : 1000,
        duration = 1000;
      d3.select(this.refs['cityLabel']).selectAll('text')
        .transition()
        .delay(delay)
        .duration(duration)
        .style('fill', (nextProps.r > 12) ? 'white' : 'transparent');

      d3.select(this.refs['cityLabel'])
        .transition()
        .duration(2000)
        .ease(d3.easeSin)
          .attr('transform', 'translate(' + (-1 * nextProps.r) + ' ' + (-1 * nextProps.r) + ')');

      d3.select(this.refs['cityLabelArc'])
        .transition()
        .duration(2000)
        .ease(d3.easeSin)
          .attr('d', DimensionsStore.getTitleLabelArc(nextProps.r));
        // .transition()
        // //.delay(2000)
        // .duration(2000)
        // .ease(d3.easeSin)
        //   .attrTween('d', () => {
        //     console.log('now');
        //     const xEnd = (this.props.r - (this.props.r-12) * Math.cos(0.2)),
        //       yEnd = Math.abs(this.props.r + (this.props.r-12) * Math.sin(0.2)),
        //       yStart = this.props.r,
        //       interiorR = this.props.r - 12;
        //     return function(t) {
        //       let path = 'M ' + (12 + t * -32) + ', ' +  (yStart - t*yStart) + ' A ' + (interiorR - t*interiorR) + ' ' + (interiorR - t*interiorR) + ', 0 1, 1 ' + ((xEnd - t*xEnd + t*300)) + ' ' + (yEnd - t*yEnd); 
        //       console.log(t, path);
        //       return path;
        //     };
        //   });

      d3.select(this.refs['bubble'])
        .transition()
        .duration(2000)
        .ease(d3.easeSin)
          .attr('r', nextProps.r)
          .style('fill', nextProps.color)
          .style('stroke', nextProps.stroke)
        .on('end', () => {
          this.setState({
            stroke: nextProps.stroke
            //windowDimensions: DimensionsStore.getMapDimensions()
          });
        });
    }
  }

  render () {
    return (
      <g 
        transform={'translate(' + this.state.cx + ' ' + this.state.cy + ')'}
        onClick={ this.props.onDistrictSelected }
        onMouseEnter={(this.props.onDistrictInspected) ? this.props.onDistrictInspected : () => false}
        onMouseLeave={(this.props.onDistrictInspected) ? this.props.onDistrictUninspected : () => false}
        id={this.props.id}
        style={{ pointerEvents: this.props.pointerEvents }}
      >
        <circle className='dorling'

          r={ this.state.r }
          fill={ this.state.color }
          style={ {
            // fillOpacity: (this.props.highlightedCities.length == 0) || this.props.highlightedCities.includes(this.props.city_id) ? 1 : 0.2,
            // strokeWidth: this.props.strokeWidth,
            // strokeOpacity: ((this.props.percentFamiliesOfColor >= this.props.pocSpan[0] && this.props.percentFamiliesOfColor <= this.props.pocSpan[1]) && (this.props.highlightedCities.length == 0 || this.props.highlightedCities.includes(this.props.city_id))) ? 1 : 0,
            stroke: this.state.stroke,
            strokeWidth: 0.33,
            fillOpacity: this.props.fillOpacity || 1,
            pointerEvents: this.props.pointerEvents
          } }
          // onClick={ (this.props.hasProjectGeojson) ? this.props.onCityClicked : this.props.onCityClicked}
          // onMouseEnter={ this.props.onCityHover }
          // onMouseLeave={ this.props.onCityOut }
          id={ this.props.id }
          ref='bubble'
          className={ 'dorling ' + this.props.className }
        />

        { (this.props.cityLabel) ? 
          <g transform={ 'translate(' + (-1 * this.state.r) + ' ' + (-1 * this.state.r) + ')' } ref='cityLabel'>
            <defs>
              <path 
                id={'ArcSegment' + this.props.cityLabel.replace(/[,\.\- ]+/g,'') }
                d={ this.state.dCityLabel }
                ref='cityLabelArc'
              />
            </defs>
            <text 
              stroke='transparent'
              fontSize={ 12 }
              textAnchor='start'
              fill='white'
              style={{ pointerEvents: 'none' }}
            >
              <textPath xlinkHref={'#ArcSegment' + this.props.cityLabel.replace(/[,\.\- ]+/g,'') } startOffset='0%'>
                { this.props.cityLabel }
              </textPath>
            </text>

          </g> : ''
        }

        { (this.props.label) ?
          <text
            x={ -3 }
            y={ 5 }
            fill='white'
            stroke='transparent'
            style={{ 
              fontSize: 12, 
              weight: 400,
              textShadow: '-1px 0 1px ' + this.props.labelColor + ', 0 1px 1px ' + this.props.labelColor + ', 1px 0 1px ' + this.props.labelColor + ', 0 -1px 1px ' + this.props.labelColor,
              pointerEvents: this.props.pointerEvents
            }}
          >
            { this.props.label }
          </text> : ''
        }
      </g>
    );
  }
}