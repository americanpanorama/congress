import * as React from 'react';
import * as d3 from 'd3';

import MapLegendPartyElement from './MapLegendPartyElement.jsx';
import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress } from '../utils/HelperFunctions';

export default class MapLegend extends React.Component {

	constructor (props) { super(props); }

	getX(perc) {
		const dimensions = DimensionsStore.getDimensions();
		const x = d3.scaleLinear()
			.domain([0.5,1])
			.range([dimensions.mapLegendRadius - dimensions.mapLegendWidth/2, dimensions.mapLegendRadius*-1]);

		return x(perc);
	}

	render() {

		const dimensions = DimensionsStore.getDimensions();

		return (
			<svg 
				width={dimensions.mapLegendWidth}
				height={dimensions.mapLegendHeight}
				id='legend'
				style={{
					right: dimensions.gutterPadding,
					bottom: dimensions.gutterPadding //dimensions.timelineHeight + dimensions.gutterPadding * 1.5
				}}
			>
				<g transform={'translate(0 ' + dimensions.mapLegendTopGutter + ')'}>
					<g>
						<MapLegendPartyElement
							party='flipped'
							label='Flipped'
							labelColor={ (!this.props.selectedParty || this.props.selectedParty == 'democrat') ? '#eee' : '#666' }
							checkboxColor={ (!this.props.selectedParty || this.props.selectedParty == 'democrat') ? '#F0B67F' : '#666' }
							selectedView={ this.props.selectedView }
							fill='grey'
							symbolLabel='F'
							onClick={ this.props.toggleFlipped }
						/>
					</g>

					<g transform={'translate(0 ' + (dimensions.mapLegendElementHeight * 2) + ')'}>
						<MapLegendPartyElement
							party='democrat'
							label='Democratic'
							labelColor={ (!this.props.selectedParty || this.props.selectedParty == 'democrat') ? '#eee' : '#666' }
							checkboxColor={ (!this.props.selectedParty || this.props.selectedParty == 'democrat') ? '#F0B67F' : '#666' }
							selectedView={ this.props.selectedView }
							gradientView={ !this.props.winnerView }
							onClick={ this.props.onPartySelected }
						/>
					</g>

					<g  transform={'translate(0 ' + (dimensions.mapLegendElementHeight * 3.5) + ')'}>
						<MapLegendPartyElement
							party='republican'
							label='Republican'
							labelColor={ (!this.props.selectedParty || this.props.selectedParty == 'republican') ? '#eee' : '#666' }
							checkboxColor={ (!this.props.selectedParty || this.props.selectedParty == 'republican') ? '#F0B67F' : '#666' }
							selectedView={ this.props.selectedView }
							gradientView={ !this.props.winnerView }
							onClick={ this.props.onPartySelected }
						/>
					</g>

					<g  transform={'translate(0 ' + (dimensions.mapLegendElementHeight * 5) + ')'}>
						<MapLegendPartyElement
							party='third'
							label='Third'
							labelColor={ (!this.props.selectedParty || this.props.selectedParty == 'third') ? '#eee' : '#666' }
							checkboxColor={ (!this.props.selectedParty || this.props.selectedParty == 'third') ? '#F0B67F' : '#666' }
							selectedView={ this.props.selectedView }
							gradientView={ !this.props.winnerView }
							onClick={ this.props.onPartySelected }
						/>
					</g>

					{ (!this.props.winnerView) ? 
						<g transform={'translate(' + dimensions.mapLegendWidth/2 + ' ' + (dimensions.mapLegendElementHeight * 6.5)+ ')'}>


							{ [0.5,0.625,0.75,0.875,1].map(sov => 
								<line
									x1={ this.getX(sov) }
									x2={ this.getX(sov) }
									y1={ dimensions.mapLegendRadius/-2}
									y2={0}
									stroke='white'
								/> : ''
							)}

							{ [0.5,0.75,1].map(sov => 
								<text
									x={ this.getX(sov) }
									y={dimensions.mapLegendFontSize * 2/3}
									textAnchor='middle'
									fontSize={dimensions.mapLegendFontSize * 2/3}
									fill='#eee'
								>
									{ (sov * 100) + '%' }
								</text> : ''
							)}
						</g> : ''
					}

				</g>


			</svg>
		);
	}


}