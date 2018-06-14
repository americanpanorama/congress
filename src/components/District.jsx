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

  componentWillReceiveProps (nextProps) {
    if (this.props.fill !== nextProps.fill ||
     this.props.stroke !== nextProps.stroke ||
     this.props.fillOpacity !== nextProps.fillOpacity ||
     this.props.strokeOpacity !== nextProps.strokeOpacity) {
      if (nextProps.duration > 0) {
        d3.select(this.district.current)
          .transition()
          .duration(nextProps.duration)
          .style('fill', nextProps.fill)
          .style('stroke', nextProps.stroke)
          .style('fill-opacity', nextProps.fillOpacity)
          .style('stroke-opacity', nextProps.strokeOpacity)
          .on('end', () => {
            this.setState({
              color: nextProps.fill,
              fillOpacity: nextProps.fillOpacity,
              strokeOpacity: nextProps.strokeOpacity
            });
          });
      } else {
        this.setState({
          color: nextProps.fill,
          fillOpacity: nextProps.fillOpacity,
          strokeOpacity: nextProps.strokeOpacity
        });
      }
    }
  }

  render () {
    return (
      <path
        d={this.props.d}
        fill={this.state.color}
        fillOpacity={this.state.fillOpacity}
        stroke={this.state.stroke}
        strokeWidth={this.props.strokeWidth}
        strokeOpacity={this.state.strokeOpacity}
        onClick={this.props.onDistrictSelected}
        onMouseEnter={this.props.onDistrictInspected}
        onMouseOver={this.props.onDistrictInspected}
        onFocus={this.props.onDistrictInspected}
        onMouseLeave={this.props.onDistrictUninspected}
        id={this.props.id}
        style={{ 
          pointerEvents: this.props.pointerEvents,
          cursor: (this.props.pointerEvents == 'auto') ? 'pointer' : 'none'
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
  id: PropTypes.string.isRequired,
  strokeOpacity: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  pointerEvents: PropTypes.string,
  onDistrictSelected: PropTypes.func.isRequired,
  onDistrictInspected: PropTypes.func,
  onDistrictUninspected: PropTypes.func,
  duration: PropTypes.number
};

District.defaultProps = {
  onDistrictInspected: () => false,
  onDistrictUninspected: () => false,
  pointerEvents: 'none',
  duration: 2000
};
