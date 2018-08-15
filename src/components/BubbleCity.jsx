import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import DimensionsStore from '../stores/DimensionsStore';

export default class BubbleCity extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      r: this.props.r,
      cx: this.props.cx,
      cy: this.props.cy,
      cityLabelOpacity: this.props.cityLabelOpacity,
      cityLabelSize: (this.props.r > 0.01) ? DimensionsStore.getDimensions().cityLabelFontSize : 0,
      dCityLabel: DimensionsStore.getTitleLabelArc(this.props.r)
    };

    this.bubble = React.createRef();
    this.circle = React.createRef();
    this.cityLabel = React.createRef();
    this.cityLabelArc = React.createRef();
    this.cityLabelText = React.createRef();
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      duration,
      r,
      cy,
      cx,
      cityLabelOpacity
    } = this.props;

    if (prevProps.r !== r || prevProps.cx !== cx ||
      prevProps.cy !== cy ||
      prevProps.cityLabelOpacity !== cityLabelOpacity) {
      if (duration > 0) {
        d3.select(this.bubble.current)
          .transition()
          .duration(duration)
          .attr('transform', `translate(${cx} ${cy})`)
          .on('end', () => {
            this.setState({
              r: r,
              cx: cx,
              cy: cy,
              cityLabelOpacity: (cityLabelOpacity),
              cityLabelSize: (r > 0.01) ? 12 : 0
            });
          });

        d3.select(this.circle.current)
          .transition()
          .duration(duration)
          .attr('r', r);

        d3.select(this.cityLabel.current)
          .transition()
          .duration(duration)
          .attr('transform', `translate(${(-1 * r)}  ${(-1 * r)}) rotate(-45, ${r}, ${r})`);

        d3.select(this.cityLabelArc.current)
          .transition()
          .duration(duration)
          .attr('d', DimensionsStore.getTitleLabelArc(r));

        d3.select(this.cityLabelText.current)
          .transition()
          .duration(duration)
          .style('fill-opacity', cityLabelOpacity)
          .style('font-size', DimensionsStore.getDimensions().cityLabelFontSize * r / Math.max(prevProps.r, r));
      } else {
        this.setState({
          r: r,
          cx: cx,
          cy: cy,
          cityLabelOpacity: cityLabelOpacity,
          cityLabelSize: (r > 0.01) ? 12 : 0
        });
      }
    }
  }

  render () {
    return (
      <g
        transform={`translate(${this.state.cx} ${this.state.cy})`}
        style={{ pointerEvents: 'none' }}
        ref={this.bubble}
      >
        <circle
          className='dorling'
          r={this.state.r}
          fill='#11181b'
          style={{
            fillOpacity: this.props.fillOpacity,
            pointerEvents: 'none'
          }}
          ref={this.circle}
        />

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
        </g>
      </g>
    );
  }
}

BubbleCity.propTypes = {
  r: PropTypes.number.isRequired,
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  fillOpacity: PropTypes.number,
  cityLabel: PropTypes.string.isRequired,
  cityLabelOpacity: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired
};

BubbleCity.defaultProps = {
  fillOpacity: 1
};
