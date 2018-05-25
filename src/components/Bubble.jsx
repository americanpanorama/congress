import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import DimensionsStore from '../stores/DimensionsStore';

export default class Bubble extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      r: this.props.r,
      color: this.props.color,
      stroke: this.props.stroke,
      cx: this.props.cx,
      cy: this.props.cy,
      cityLabelOpacity: (this.props.r > 0.01) ? 1 : 0,
      cityLabelSize: (this.props.r > 0.01) ? DimensionsStore.getDimensions().cityLabelFontSize : 0,
      dCityLabel: DimensionsStore.getTitleLabelArc(this.props.r)
    };

    this.bubble = React.createRef();
    this.circle = React.createRef();
    this.cityLabel = React.createRef();
    this.cityLabelArc = React.createRef();
    this.cityLabelText = React.createRef();
  }

  componentWillReceiveProps (nextProps) {
    const { duration } = nextProps;

    if (this.props.r !== nextProps.r || this.props.color !== nextProps.color ||
      this.props.stroke !== nextProps.stroke || this.props.cx !== nextProps.cx ||
      this.props.cy !== nextProps.cy) {
      if (duration > 0) {
        d3.select(this.bubble.current)
          .transition()
          .duration(duration)
          .ease(d3.easeSin)
          .attr('r', nextProps.r)
          .attr('transform', `translate(${nextProps.cx} ${nextProps.cy})`)
          .attr('cy', nextProps.cy)
          .style('fill', nextProps.color)
          .style('stroke', nextProps.stroke)
          .on('end', () => {
            this.setState({
              r: nextProps.r,
              cityLabelOpacity: (nextProps.r > 0.01) ? 1 : 0,
              cityLabelSize: (nextProps.r > 0.01) ? 12 : 0,
              stroke: nextProps.stroke
            });
          });

        d3.select(this.circle.current)
          .transition()
          .duration(duration)
          .ease(d3.easeSin)
          .attr('r', nextProps.r)
          .style('fill', nextProps.color)
          .style('stroke', nextProps.stroke);

        d3.select(this.cityLabel.current)
          .transition()
          .duration(duration)
          .ease(d3.easeSin)
          .attr('transform', `translate(${(-1 * nextProps.r)}  ${(-1 * nextProps.r)}) rotate(-45, ${nextProps.r}, ${nextProps.r})`);

        d3.select(this.cityLabelArc.current)
          .transition()
          .duration(duration)
          .ease(d3.easeSin)
          .attr('d', DimensionsStore.getTitleLabelArc(nextProps.r));

        d3.select(this.cityLabelText.current)
          .transition()
          .duration(duration)
          .ease(d3.easeSin)
          .style('fill-opacity', nextProps.r / Math.max(this.props.r, nextProps.r))
          .style('font-size', DimensionsStore.getDimensions().cityLabelFontSize * nextProps.r / Math.max(this.props.r, nextProps.r));
      } else {
        this.setState({
          r: nextProps.r,
          cityLabelOpacity: (nextProps.r > 0.01) ? 1 : 0,
          cityLabelSize: (nextProps.r > 0.01) ? 12 : 0,
          stroke: nextProps.stroke
        });
      }
    }
  }

  render () {
    return (
      <g
        transform={`translate(${this.state.cx} ${this.state.cy})`}
        onClick={this.props.onDistrictSelected}
        onMouseEnter={this.props.onDistrictInspected}
        onMouseLeave={this.props.onDistrictUninspected}
        id={this.props.id}
        style={{ pointerEvents: this.props.pointerEvents }}
        ref={this.bubble}
      >
        <circle
          className='dorling'
          r={this.state.r}
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

        { (this.props.cityLabel) ?
          <g
            transform={`translate(${-1 * this.state.r} ${-1 * this.state.r}) rotate(-45, ${this.state.r}, ${this.state.r})`}
            ref={this.cityLabel}
          >
            <defs>
              <path
                id={`ArcSegment${this.props.cityLabel.replace(/[,\.\- ]+/g, '')}`}
                d={this.state.dCityLabel}
                ref={this.cityLabelArc}
              />
            </defs>
            <text
              stroke='transparent'
              fill='white'
              ref={this.cityLabelText}
              textAnchor='middle'
              style={{
                pointerEvents: 'none',
                fillOpacity: this.state.cityLabelOpacity,
                fontSize: this.state.cityLabelSize
              }}
            >
              <textPath
                xlinkHref={`#ArcSegment${this.props.cityLabel.replace(/[,\.\- ]+/g, '')}`}
                startOffset='50%'
              >
                { this.props.cityLabel }
              </textPath>
            </text>
          </g> : ''
        }

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
  cityLabel: PropTypes.string,
  onDistrictSelected: PropTypes.func,
  onDistrictInspected: PropTypes.func,
  onDistrictUninspected: PropTypes.func,
  pointerEvents: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  labelColor: PropTypes.string,
  duration: PropTypes.number.isRequired
};

Bubble.defaultProps = {
  fillOpacity: 1,
  cityLabel: '',
  onDistrictSelected: () => false,
  onDistrictInspected: () => false,
  onDistrictUninspected: () => false,
  pointerEvents: 'none',
  id: '',
  label: '',
  labelColor: ''
};
