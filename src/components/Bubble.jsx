import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Bubble extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      fill: this.props.fill,
      stroke: this.props.stroke,
      cx: this.props.cx,
      cy: this.props.cy
    };

    this.bubble = React.createRef();
    this.circle = React.createRef();
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      duration,
      fill,
      cx,
      cy,
      stroke
    } = this.props;

    if (prevProps.fill !== fill || prevProps.stroke !== stroke ||
      prevProps.cx !== cx || prevProps.cy !== cy) {
      if (duration > 0) {
        // only transition if the position has changed
        if (prevProps.cx !== cx || prevProps.cy !== cy) {
          d3.select(this.bubble.current)
            .transition()
            .duration(duration)
            .attr('transform', `translate(${cx} ${cy})`);
        }

        d3.select(this.circle.current)
          .transition()
          .duration(duration)
          .style('fill', fill)
          .style('stroke', stroke)
          .on('end', () => {
            this.setState({
              cx: cx,
              cy: cy,
              stroke: stroke,
              fill: fill
            });
          });
      } else {
        this.setState({
          stroke: stroke,
          fill: fill,
          cx: cx,
          cy: cy
        });
      }
    }
  }

  render () {
    return (
      <g
        transform={`translate(${this.state.cx} ${this.state.cy})`}
        onClick={this.props.onDistrictSelected}
        id={this.props.id}
        style={{
          pointerEvents: this.props.pointerEvents,
          cursor: (this.props.pointerEvents === 'auto') ? 'pointer' : 'none'
        }}
        ref={this.bubble}
      >
        <circle
          className='dorling'
          r={this.props.r}
          style={{
            fill: this.state.fill,
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
  fill: PropTypes.string.isRequired,
  stroke: PropTypes.string.isRequired,
  fillOpacity: PropTypes.number,
  label: PropTypes.string,
  labelColor: PropTypes.string,
  onDistrictSelected: PropTypes.func.isRequired,
  pointerEvents: PropTypes.string,
  id: PropTypes.string,
  duration: PropTypes.number
};

Bubble.defaultProps = {
  fillOpacity: 1,
  pointerEvents: 'none',
  id: ' ',
  label: '',
  labelColor: '',
  duration: 1000
};
