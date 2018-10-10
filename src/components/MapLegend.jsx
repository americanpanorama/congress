import * as React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import MapLegendPartyElement from './MapLegendPartyElement';
import DimensionsStore from '../stores/DimensionsStore';
import { getColorForParty, getColorForMargin } from '../utils/HelperFunctions';

export default class MapLegend extends React.Component {
  render () {
    const dimensions = DimensionsStore.getDimensions();
    const getX = (perc) => {
      const x = d3.scaleLinear()
        .domain([0.5, 1])
        .range([dimensions.mapLegendRadius - dimensions.mapLegendWidth / 2,
          dimensions.mapLegendRadius * -1]);
      return x(perc);
    };

    const axisY = (this.props.hasThird)
      ? dimensions.mapLegendElementHeight * 6.5
      : dimensions.mapLegendElementHeight * 5;

    const gtY = (this.props.hasThird)
      ? dimensions.mapLegendElementHeight * 9.5
      : dimensions.mapLegendElementHeight * 8;

    const gtElectionColor = (n) => {
      if (n === 0 || n === 8 || n === 3 || n === 4) {
        return getColorForParty('democrat');
      } else if (n === 1 || n === 6 || n === 2 || n === 5) {
        return getColorForParty('republican');
      }
      return getColorForParty('third');
    };

    return (
      <svg
        width={dimensions.mapLegendWidth}
        height={dimensions.mapLegendHeight}
        id='legend'
        style={{
          right: dimensions.gutterPadding,
          bottom: dimensions.gutterPadding
        }}
      >
        <g transform={`translate(0 ${dimensions.mapLegendTopGutter})`}>
          <g>
            <MapLegendPartyElement
              party='flipped'
              label='Flipped'
              labelColor='white'
              checkboxColor={(this.props.onlyFlipped) ? '#F0B67F' : '#666'}
              selectedView={this.props.selectedView}
              fill='grey'
              symbolLabel='F'
              onClick={this.props.toggleFlipped}
            />
          </g>

          <g transform={`translate(0 ${dimensions.mapLegendElementHeight * 2})`}>
            <MapLegendPartyElement
              party='democrat'
              label='Democratic'
              labelColor={(!this.props.selectedParty || this.props.selectedParty === 'democrat') ? '#eee' : '#666'}
              checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'democrat') ? '#F0B67F' : '#666'}
              selectedView={this.props.selectedView}
              gradientView={!this.props.winnerView}
              onClick={this.props.onPartySelected}
            />
          </g>

          <g transform={`translate(0 ${dimensions.mapLegendElementHeight * 3.5})`}>
            { (this.props.selectedYear >= 1856) &&
              <MapLegendPartyElement
                party='republican'
                label='Republican'
                labelColor={(!this.props.selectedParty || this.props.selectedParty === 'republican') ? '#eee' : '#666'}
                checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'republican') ? '#F0B67F' : '#666'}
                selectedView={this.props.selectedView}
                gradientView={!this.props.winnerView}
                onClick={this.props.onPartySelected}
              />
            }

            { (this.props.selectedYear === 1854) &&
              <MapLegendPartyElement
                party='opposition'
                label='Opposition'
                labelColor={(!this.props.selectedParty || this.props.selectedParty === 'opposition') ? '#eee' : '#666'}
                checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'opposition') ? '#F0B67F' : '#666'}
                selectedView={this.props.selectedView}
                winnerView={this.props.winnerView}
                gradientView={!this.props.winnerView}
                onClick={this.props.onPartySelected}
              />
            }

            { (this.props.selectedYear < 1854) &&
              <MapLegendPartyElement
                party='whig'
                label='Whig'
                labelColor={(!this.props.selectedParty || this.props.selectedParty === 'whig') ? '#eee' : '#666'}
                checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'whig') ? '#F0B67F' : '#666'}
                selectedView={this.props.selectedView}
                winnerView={this.props.winnerView}
                gradientView={!this.props.winnerView}
                onClick={this.props.onPartySelected}
              />
            }
          </g>

          { (this.props.selectedYear === 1854) &&
            <React.Fragment>
              <g transform={`translate(0 ${dimensions.mapLegendElementHeight * 5})`}>
                <MapLegendPartyElement
                  party='whig'
                  label='Whig'
                  labelColor={(!this.props.selectedParty || this.props.selectedParty === 'whig') ? '#eee' : '#666'}
                  checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'whig') ? '#F0B67F' : '#666'}
                  selectedView={this.props.selectedView}
                  winnerView={this.props.winnerView}
                  gradientView={!this.props.winnerView}
                  onClick={this.props.onPartySelected}
                />
              </g>
              <g transform={`translate(0 ${dimensions.mapLegendElementHeight * 6.5})`}>
                <MapLegendPartyElement
                  party='third'
                  label='Third'
                  labelColor={(!this.props.selectedParty || this.props.selectedParty === 'third') ? '#eee' : '#666'}
                  checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'third') ? '#F0B67F' : '#666'}
                  selectedView={this.props.selectedView}
                  winnerView={this.props.winnerView}
                  gradientView={!this.props.winnerView}
                  onClick={this.props.onPartySelected}
                />
              </g>
            </React.Fragment>
          }

          { (this.props.hasThird && this.props.selectedYear !== 1854) &&
            <g transform={`translate(0 ${dimensions.mapLegendElementHeight * 5})`}>
              <MapLegendPartyElement
                party='third'
                label='Third'
                labelColor={(!this.props.selectedParty || this.props.selectedParty === 'third') ? '#eee' : '#666'}
                checkboxColor={(!this.props.selectedParty || this.props.selectedParty === 'third') ? '#F0B67F' : '#666'}
                selectedView={this.props.selectedView}
                winnerView={this.props.winnerView}
                gradientView={!this.props.winnerView}
                onClick={this.props.onPartySelected}
              />
            </g>
          }

          { (!this.props.winnerView) &&
            <g transform={`translate(${dimensions.mapLegendWidth / 2} ${axisY})`}>
              { [0.5, 0.625, 0.75, 0.875, 1].map(sov => (
                <line
                  x1={getX(sov)}
                  x2={getX(sov)}
                  y1={dimensions.mapLegendRadius / -2}
                  y2={0}
                  stroke='white'
                  key={`sovLine${sov}`}
                />
              ))}

              { [0.5, 0.75, 1].map(sov => (
                <text
                  x={getX(sov)}
                  y={dimensions.mapLegendFontSize * 2 / 3}
                  textAnchor='middle'
                  fontSize={dimensions.mapLegendFontSize * 2 / 3}
                  fontWeight={100}
                  fill='#eee'
                  key={`sovText${sov}`}
                >
                  {`${sov * 100}%`}
                </text>
              ))}

              <text
                x={getX(0.75)}
                y={dimensions.mapLegendFontSize * 4 / 3}
                textAnchor='middle'
                fontSize={dimensions.mapLegendFontSize * 2 / 3}
                fill='#eee'
                fontWeight={100}
              >
                strength of victory
              </text>
            </g>
          }

        </g>

        { (this.props.hasGTElection) &&
          <g transform={`translate(${dimensions.mapLegendWidth / 2} ${gtY})`}>
            <title>In general ticket elections, voters did not elect single members for a particular district but instead voted multiple times to elect multiple representatives.</title>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <React.Fragment key={`gtlegend${n}`}>
                <rect
                  x={dimensions.mapLegendRadius * -2 - (n % 3) * dimensions.mapLegendRadius}
                  y={Math.floor(n / 3) * dimensions.mapLegendRadius}
                  width={dimensions.mapLegendRadius}
                  height={dimensions.mapLegendRadius}
                  strokeWidth={1}
                  stroke='white'
                  fill={gtElectionColor(n)}
                  className='gtlegend'
                />

                <text
                  fill='white'
                  fontSize={dimensions.mapLegendFontSize * 2 / 3}
                >
                  <tspan x={dimensions.mapLegendRadius} y={0}>General</tspan>
                  <tspan x={dimensions.mapLegendRadius} y='1.2em'>Ticket</tspan>
                  <tspan x={dimensions.mapLegendRadius} y='2.4em'>Election</tspan>
                </text>
              </React.Fragment>
            ))}
          </g>
        }
      </svg>
    );
  }
}

MapLegend.propTypes = {
  selectedView: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  selectedParty: PropTypes.string,
  onPartySelected: PropTypes.func.isRequired,
  winnerView: PropTypes.bool.isRequired,
  onlyFlipped: PropTypes.bool.isRequired,
  toggleFlipped: PropTypes.func.isRequired,
  hasThird: PropTypes.bool.isRequired,
  hasGTElection: PropTypes.bool.isRequired
};

MapLegend.defaultProps = {
  selectedParty: null
};
