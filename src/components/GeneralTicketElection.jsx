import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class GeneralTicketElection extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      fill: props.fill,
      stroke: props.stroke,
      fillOpacity: props.fillOpacity,
      strokeOpacity: props.strokeOpacity
    };

    this.symbol = React.createRef();
  }

  componentDidUpdate (prevProps) {
    const { duration } = this.props;

    if (prevProps.fill !== this.props.fill ||
      prevProps.fillOpacity !== this.props.fillOpacity) {

      if (duration > 0) {
        d3.select(this.symbol.current)
          .transition()
          .duration(duration)
          .style('fill', this.props.fill)
          .style('stroke', this.props.stroke)
          .style('fill-opacity', this.props.fillOpacity)
          .style('stroke-opacity', this.props.strokeOpacity)
          .on('end', () => {
            this.setState({
              fill: this.props.fill,
              stroke: this.props.stroke,
              fillOpacity: this.props.fillOpacity,
              strokeOpacity: this.props.strokeOpacity
            });
          });
      } else {
        this.setState({
          fill: this.props.fill,
          stroke: this.props.stroke,
          fillOpacity: this.props.fillOpacity,
          strokeOpacity: this.props.strokeOpacity
        });
      }
    }
  }

  render () {
    const {
      x,
      y,
      length,
      id,
      onDistrictSelected
    } = this.props;

    return (
      <rect
        key={`gt${id}`}
        x={x}
        y={y}
        width={length}
        height={length}
        style={{
          fill: this.state.fill,
          fillOpacity: this.state.fillOpacity,
          strokeWidth: this.props.strokeWidth,
          stroke: this.state.stroke,
          strokeOpacity: this.state.strokeOpacity
        }}
        stroke='#eee'
        onClick={onDistrictSelected}
        id={id}
        ref={this.symbol}
      />
    );
  }
}

GeneralTicketElection.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
  fillOpacity: PropTypes.number,
  strokeWidth: PropTypes.number.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  id: PropTypes.number,
  duration: PropTypes.number
};

GeneralTicketElection.defaultProps = {
  fillOpacity: 1,
  id: ' ',
  duration: 1000
};
