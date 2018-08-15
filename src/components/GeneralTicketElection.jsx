import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Bubble extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      fill: props.fill,
      fillOpacity: props.fillOpacity
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
          .on('end', () => {
            this.setState({
              fill: this.props.fill
            });
          });
      } else {
        this.setState({
          fill: this.props.fill
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
          fillOpacity: this.state.fillOpacity
        }}
        stroke='#eee'
        strokeWidth={1}
        onClick={onDistrictSelected}
        id={id}
        ref={this.symbol}
      />
    );
  }
}

Bubble.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
  fillOpacity: PropTypes.number,
  onDistrictSelected: PropTypes.func.isRequired,
  id: PropTypes.string,
  duration: PropTypes.number
};

Bubble.defaultProps = {
  fillOpacity: 1,
  id: ' ',
  duration: 500
};
