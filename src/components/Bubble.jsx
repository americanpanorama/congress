import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Bubble extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      color: this.props.color,
      stroke: this.props.stroke,
      cx: this.props.cx,
      cy: this.props.cy
    };

    this.bubble = React.createRef();
    this.circle = React.createRef();
  }

  componentWillReceiveProps (nextProps) {
    const { duration } = nextProps;

    if (this.props.color !== nextProps.color || this.props.stroke !== nextProps.stroke ||
      this.props.cx !== nextProps.cx || this.props.cy !== nextProps.cy) {
      if (duration > 0) {
        d3.select(this.bubble.current)
          .transition()
          .duration(duration)
          .attr('transform', `translate(${nextProps.cx} ${nextProps.cy})`)
          .on('end', () => {
            this.setState({
              stroke: nextProps.stroke,
              color: nextProps.color,
              cx: nextProps.cx,
              cy: nextProps.cy
            });
          });

        d3.select(this.circle.current)
          .transition()
          .duration(duration)
          .style('fill', nextProps.color)
          .style('stroke', nextProps.stroke);
      } else {
        this.setState({
          stroke: nextProps.stroke,
          color: nextProps.color,
          cx: nextProps.cx,
          cy: nextProps.cy
        });
      }
    }
  }

  // componentDidUpdate (nextProps) {
  //   const { 
  //     cx,
  //     cy,
  //     color,
  //     stroke,
  //     duration
  //   } = nextProps;

  //   d3.select(this.bubble.current)
  //     .transition()
  //     .duration(duration)
  //     .attr('transform', `translate(${cx} ${cy})`)
  //     .on('end', () => {
  //       this.setState({
  //         stroke: stroke,
  //         color: color,
  //         cx: cx,
  //         cy: cy
  //       });
  //     });

  //   d3.select(this.circle.current)
  //     .transition()
  //     .duration(duration)
  //     .style('fill', color)
  //     .style('stroke', stroke);
  // }

  render () {
    return (
      <g
        transform={`translate(${this.state.cx} ${this.state.cy})`}
        onClick={this.props.onDistrictSelected}
        id={this.props.id}
        style={{ 
          pointerEvents: this.props.pointerEvents,
          cursor: (this.props.pointerEvents == 'auto') ? 'pointer' : 'none'
        }}
        ref={this.bubble}
      >
        <circle
          className='dorling'
          r={this.props.r}
          fill={this.state.color}
          style={{
            stroke: this.state.stroke,
            strokeWidth: 0.33,
            fillOpacity: this.props.fillOpacity,
            pointerEvents: this.props.pointerEvents
          }}
          id={this.props.id}
          ref={this.circle}
        />

        { (this.props.label) ?
          <text
            x={0}
            y={this.props.r * 0.5}
            fill='white'
            stroke='transparent'
            textAnchor='middle'
            style={{
              fontSize: this.props.r * 1.5,
              weight: 400,
              textShadow: `-1px 0 1px ${this.props.labelColor}, 0 1px 1px ${this.props.labelColor} , 1px 0 1px ${this.props.labelColor}, 0 -1px 1px ${this.props.labelColor}`,
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

Bubble.propTypes = {
  r: PropTypes.number.isRequired,
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  stroke: PropTypes.string.isRequired,
  fillOpacity: PropTypes.number,
  label: PropTypes.string,
  labelColor: PropTypes.string,
  onDistrictSelected: PropTypes.func.isRequired,
  pointerEvents: PropTypes.string,
  id: PropTypes.string,
  duration: PropTypes.number.isRequired
};

Bubble.defaultProps = {
  fillOpacity: 1,
  pointerEvents: 'none',
  id: ' ',
  label: '',
  labelColor: ''
};
