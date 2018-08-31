import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class District extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      color: this.props.fill,
      stroke: this.props.stroke,
      fillOpacity: this.props.fillOpacity,
      strokeOpacity: this.props.strokeOpacity
    };

    this.district = React.createRef();
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.fill !== prevProps.fill ||
     this.props.stroke !== prevProps.stroke ||
     this.props.fillOpacity !== prevProps.fillOpacity ||
     this.props.strokeOpacity !== prevProps.strokeOpacity) {
      if (this.props.duration > 0) {
        d3.select(this.district.current)
          .transition()
          .duration(this.props.duration)
          .style('fill', this.props.fill)
          .style('stroke', this.props.stroke)
          .style('fill-opacity', this.props.fillOpacity)
          .style('stroke-opacity', this.props.strokeOpacity)
          .on('end', () => {
            this.setState({
              color: this.props.fill,
              stroke: this.props.stroke,
              fillOpacity: this.props.fillOpacity,
              strokeOpacity: this.props.strokeOpacity
            });
          });
      } else {
        this.setState({
          color: this.props.fill,
          stroke: this.props.stroke,
          fillOpacity: this.props.fillOpacity,
          strokeOpacity: this.props.strokeOpacity
        });
      }
    }
  }

  render () {
    return (
      <path
        d={this.props.d}
        onClick={this.props.onDistrictSelected}
        id={this.props.id}
        style={{
          pointerEvents: this.props.pointerEvents,
          cursor: (this.props.pointerEvents === 'auto') ? 'pointer' : 'none',
          fill: this.state.color,
          fillOpacity: this.state.fillOpacity,
          stroke: this.state.stroke,
          strokeOpacity: this.state.strokeOpacity,
          strokeWidth: this.props.strokeWidth
        }}
        ref={this.district}
      />
    );
  }
}

District.propTypes = {
  d: PropTypes.string.isRequired,
  fill: PropTypes.string.isRequired,
  stroke: PropTypes.string.isRequired,
  fillOpacity: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  strokeOpacity: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number,
  pointerEvents: PropTypes.string,
  onDistrictSelected: PropTypes.func.isRequired,
  duration: PropTypes.number
};

District.defaultProps = {
  pointerEvents: 'none',
  duration: 1000,
  strokeWidth: 0
};
