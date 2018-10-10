import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import DimensionsStore from '../stores/DimensionsStore';
import { getColorForMargin } from '../utils/HelperFunctions';

export default class MapLegendParty extends React.Component {
  render () {
    const dimensions = DimensionsStore.getDimensions();
    const getX = (perc) => {
      const x = d3.scaleLinear()
        .domain([0.5, 1])
        .range([dimensions.mapLegendRadius - dimensions.mapLegendWidth / 2,
          dimensions.mapLegendRadius * -1]);
      return x(perc);
    };
    const getXWithRadius = (perc) => {
      const x = d3.scaleLinear()
        .domain([0.5, 1])
        .range([dimensions.mapLegendRadius * 2 - dimensions.mapLegendWidth / 2,
          dimensions.mapLegendRadius * -2]);
      return x(perc);
    };

    const ticks = (!this.props.gradientView) ? [1] : [1, 0.875, 0.75, 0.625, 0.5];

    return (
      <g
        transform={`translate(${dimensions.mapLegendWidth / 2})`}
        onClick={this.props.onClick}
        id={this.props.party}
        className='mapLegendControl'
      >
        <defs>
          <linearGradient id={`${this.props.party}-Gradient`}>
            <stop offset='0%' stopColor={getColorForMargin(this.props.party, 0.5)} />
            <stop offset='8%' stopColor={getColorForMargin(this.props.party, 0.54)} />
            <stop offset='100%' stopColor={getColorForMargin(this.props.party, 1)} />
          </linearGradient>
        </defs>

        <text
          x={dimensions.mapLegendRadius}
          y={dimensions.mapLegendFontSize}
          textAnchor='start'
          fill={this.props.labelColor}
          fontSize={dimensions.mapLegendFontSize}
        >
          {this.props.label}
          <tspan fill={this.props.checkboxColor}> ✓</tspan>
        </text>

        { (this.props.selectedView === 'map') ?
          <rect
            x={(!this.props.gradientView) ? getX(1) - dimensions.mapLegendRadius * 2 : getX(0.5)}
            y={0}
            width={(!this.props.gradientView) ? dimensions.mapLegendRadius * 2 : getX(1) - getX(0.5)}
            height={dimensions.mapLegendRadius * 2}
            fill={(this.props.fill) ? this.props.fill : (!this.props.gradientView) ? getColorForMargin(this.props.party, 1) : `url(#${this.props.party}-Gradient)`}
          /> :
          <g>
            { ticks.map((sov, i) => (
              <circle
                cx={getXWithRadius(sov)}
                cy={dimensions.mapLegendRadius}
                r={dimensions.mapLegendRadius}
                fill={(this.props.fill) ? this.props.fill : getColorForMargin(this.props.party, sov)}
                key={`legendBubble-${this.props.party}-${sov}`}
              />
            ))}
          </g>
        }

        { (this.props.symbolLabel) &&
          <text
            x={dimensions.mapLegendRadius * -2}
            y={dimensions.mapLegendRadius * 1.5}
            fill='white'
            stroke='transparent'
            textAnchor='middle'
            style={{
              fontSize: dimensions.mapLegendFontSize * 2 / 3,
              weight: 400,
              textShadow: `-1px 0 1px ${this.props.fill}, 0 1px 1px ${this.props.fill}, 1px 0 1px ${this.props.fill}, 0 -1px 1px ' + ${this.props.labelColor}`
            }}
          >
            {this.props.symbolLabel}
          </text>
        }
      </g>
    );
  }
}

MapLegendParty.propTypes = {
  party: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  labelColor: PropTypes.string.isRequired,
  checkboxColor: PropTypes.string.isRequired,
  selectedView: PropTypes.string.isRequired,
  gradientView: PropTypes.bool,
  symbolLabel: PropTypes.string,
  fill: PropTypes.string
};

MapLegendParty.defaultProps = {
  symbolLabel: '',
  fill: '',
  gradientView: false
};
