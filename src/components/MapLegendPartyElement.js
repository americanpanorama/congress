import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress } from '../utils/HelperFunctions';

export default class MapLegend extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      gradientWidth: (this.props.winnerView) ? 15 : 120,
      gradientX: (this.props.winnerView) ? -25 : -130,
      demFill: (this.props.winnerView) ?getColorForMargin('Democrat', 1) : 'url(#DemGradient)',
      repFill: (this.props.winnerView) ?getColorForMargin('Republican', 1) : 'url(#RepGradient)',
      thirdFill: (this.props.winnerView) ?getColorForMargin('third', 1) : 'url(#ThirdGradient)',
    };
  }

  componentWillReceiveProps(nextProps) {
  	if ( this.props.selectedView !== nextProps.selectedView) {
  		this.setState({
        gradientX: (nextProps.winnerView) ? -30 : -130,
        gradientWidth: (nextProps.winnerView) ? 20 : 120,
        demFill: (nextProps.winnerView) ?getColorForMargin('Democrat', 1) : 'url(#DemGradient)',
      });
  	}


    if ( this.props.winnerView !== nextProps.winnerView ) {
      d3.select(this.refs['demGradient'])
        .transition()
        .duration(250)
        	.attr('width', (nextProps.winnerView) ? 20 : 120)
          .attr('x', (nextProps.winnerView) ? -30 : -130)
          .attr('fill', (nextProps.winnerView) ?getColorForMargin('Democrat', 1) : 'url(#DemGradient)')
        .on('end', () => {
          this.setState({
            gradientX: (nextProps.winnerView) ? -30 : -130,
            gradientWidth: (nextProps.winnerView) ? 20 : 120,
            demFill: (nextProps.winnerView) ?getColorForMargin('Democrat', 1) : 'url(#DemGradient)',
          });
        });

      d3.select(this.refs['repGradient'])
        .transition()
        .duration(250)
        	.attr('width', (nextProps.winnerView) ? 20 : 120)
          .attr('x', (nextProps.winnerView) ? -30 : -130)
          .attr('fill', (nextProps.winnerView) ?getColorForMargin('Republican', 1) : 'url(#RepGradient)')
        .on('end', () => {
          this.setState({
            gradientX: (nextProps.winnerView) ? -30 : -130,
            gradientWidth: (nextProps.winnerView) ? 20 : 120,
            repFill: (nextProps.winnerView) ?getColorForMargin('Republican', 1) : 'url(#RepGradient)',
          });
        });

      d3.select(this.refs['thirdGradient'])
        .transition()
        .duration(250)
        	.attr('width', (nextProps.winnerView) ? 20 : 120)
          .attr('x', (nextProps.winnerView) ? -30 : -130)
          .attr('fill', (nextProps.winnerView) ?getColorForMargin('Third', 1) : 'url(#ThirdGradient)')
        .on('end', () => {
          this.setState({
            gradientX: (nextProps.winnerView) ? -30 : -130,
            gradientWidth: (nextProps.winnerView) ? 20 : 120,
            thirdFill: (nextProps.winnerView) ?getColorForMargin('Third', 1) : 'url(#ThirdGradient)',
          });
        });
    }
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




				{/* JSX Comment 
				<rect
					width={350}
					height={150}
					fill='#eee'
				/> */}

				<defs>
					<linearGradient id="DemGradient">
						<stop offset="0%" stopColor={ getColorForMargin('Democrat', 0.5) } />
						<stop offset="8%" stopColor={ getColorForMargin('Democrat', 0.54) } />
						<stop offset="100%" stopColor={ getColorForMargin('Democrat', 1) } />
					</linearGradient>
					<linearGradient id="RepGradient">
						<stop offset="0%" stopColor={ getColorForMargin('Republican', 0.5) } />
						<stop offset="8%" stopColor={ getColorForMargin('Republican', 0.54) } />
						<stop offset="100%" stopColor={ getColorForMargin('Republican', 1) } />
					</linearGradient>
					<linearGradient id="ThirdGradient">
						<stop offset="0%" stopColor={ getColorForMargin('third', 0.5) } />
						<stop offset="9%" stopColor={ getColorForMargin('third', 0.54) } />
						<stop offset="100%" stopColor={ getColorForMargin('third', 1) } />
					</linearGradient>
				</defs>

				<g transform={'translate(' + dimensions.mapLegendWidth/2 + ' ' + dimensions.mapLegendTopGutter + ')'}>
					<circle 
						cx={ dimensions.mapLegendRadius * -2  }
						cy={ dimensions.mapLegendRadius  }
						r={ dimensions.mapLegendRadius }
						fill={ 'grey'}
					/>

					<text
						x={ dimensions.mapLegendRadius * -2 }
						y={ dimensions.mapLegendRadius * 1.5 }
						fill='white'
						stroke='transparent'
						textAnchor='middle'
						style={{ 
							fontSize: dimensions.mapLegendFontSize, 
							weight: 400,
							textShadow: '-1px 0 1px ' + this.props.labelColor + ', 0 1px 1px ' + this.props.labelColor + ', 1px 0 1px ' + this.props.labelColor + ', 0 -1px 1px ' + this.props.labelColor
						}}
					>
						F
					</text>

					<text
						x={0}
						y={dimensions.mapLegendFontSize}
						textAnchor='start'
						fill={ '#eee' }
						fill={ (this.props.onlyFlipped) ? '#F0B67F' : '#eee' }
						fontSize={ dimensions.mapLegendFontSize }
						onClick={ this.props.toggleFlipped }
					>
						Flipped
						<tspan 
							fill={ (this.props.onlyFlipped) ? '#F0B67F' : '#666' }
							onClick={ this.props.toggleFlipped }
						> ✓</tspan>
					</text>
				</g>


				<g transform={'translate(' + dimensions.mapLegendWidth/2 + ' ' + (dimensions.mapLegendTopGutter + dimensions.mapLegendFontSize) + ')'}>

					<text
						x={0}
						y={dimensions.mapLegendFontSize}
						textAnchor='start'
						onClick={ this.props.onPartySelected }
						id='democrat'
						fill={ (!this.props.selectedParty || this.props.selectedParty == 'democrat') ? '#eee' : '#666' }
						fontSize={ dimensions.mapLegendFontSize }
					>
						Democratic
						<tspan 
							fill={ (!this.props.selectedParty || this.props.selectedParty == 'democrat') ? '#F0B67F' : '#666' }
							onClick={ this.props.onPartySelected }
							id='democrat'
							> ✓</tspan>
					</text>

					{ (this.props.selectedView == 'map') ?
						<rect 
							x={ this.state.gradientX }
							y={ dimensions.mapLegendGutter }
							width={ this.state.gradientWidth }
							height={ dimensions.mapLegendSymbolHeight}
							fill={ this.state.demFill }
							ref='demGradient'
						/> :
						<g>
							{ ((this.props.winnerView) ? [1] : [1,0.9166,0.8333,0.75,0.666,0.5833,0.5]).map((sov,i) => 
								<circle
									cx={ dimensions.mapLegendRadius * -2  }
									cy={ dimensions.mapLegendRadius  }
									r={ dimensions.mapLegendRadius }
									fill={ getColorForMargin('democratic', sov) }
									key={'demBubble'+i}
								/>
							)}
						</g>
					}

				</g>


				<g transform={'translate(' + dimensions.mapLegendWidth/2 + ' ' + dimensions.mapLegendHeight / 2 + ')'}>



					<text
						x={0}
						y={dimensions.mapLegendGutter * 2 +  dimensions.mapLegendSymbolHeight * 2}
						textAnchor='start'
						onClick={ this.props.onPartySelected }
						id='republican'
						fill={ (!this.props.selectedParty || this.props.selectedParty == 'republican') ? '#eee' : '#666' }
						fontSize={ dimensions.mapLegendFontSize }
					> 
						Republican
						<tspan 
							fill={ (!this.props.selectedParty || this.props.selectedParty == 'republican') ? '#F0B67F' : '#666' }
							onClick={ this.props.onPartySelected }
							id='republican'
							> ✓</tspan>
					</text>

					{ (this.props.selectedView == 'map') ?
						<rect 
							x={ this.state.gradientX }
							y={dimensions.mapLegendGutter * 2 +  dimensions.mapLegendSymbolHeight}
							width={ this.state.gradientWidth }
							height={ dimensions.mapLegendSymbolHeight}
							fill={ this.state.repFill }
							ref='repGradient'
						/> :
						<g>
							{ ((this.props.winnerView) ? [1] : [1,0.9166,0.8333,0.75,0.666,0.5833,0.5]).map((sov,i) => 
								<circle
									cx={ -17.5 - (105/120) * (1-sov)*240 }
									cy={ 27.5 }
									r={ dimensions.mapLegendRadius }
									fill={ getColorForMargin('republican', sov) }
									key={'repBubble'+i}
								/>
							)}
						</g>
					}

					<text
						x={0}
						y={dimensions.mapLegendGutter * 3 +  dimensions.mapLegendSymbolHeight * 3}
						textAnchor='start'
						onClick={ this.props.onPartySelected }
						id='third'
						fill={ (!this.props.selectedParty || this.props.selectedParty == 'third') ? '#eee' : '#666' }
						fontSize={ dimensions.mapLegendFontSize }
					>
						Third
						<tspan 
							fill={ (!this.props.selectedParty || this.props.selectedParty == 'third') ? '#F0B67F' : '#666' }
							onClick={ this.props.onPartySelected }
							id='third'
						> ✓</tspan>
					</text>

					{ (this.props.selectedView == 'map') ?
						<rect 
							x={ this.state.gradientX }
							y={dimensions.mapLegendGutter * 3 +  dimensions.mapLegendSymbolHeight * 2}
							width={ this.state.gradientWidth }
							height={ dimensions.mapLegendSymbolHeight}
							fill={ this.state.thirdFill }
							ref='thirdGradient'
						/> :
						<g>
							{ ((this.props.winnerView) ? [1] : [1,0.9166,0.8333,0.75,0.666,0.5833,0.5]).map((sov,i) => 
								<circle
									cx={ -17.5 - (105/120) * (1-sov)*240 }
									cy={ 47.5 }
									r={ dimensions.mapLegendRadius }
									fill={ getColorForMargin('third', sov) }
									key={'thirdBubble'+i}
								/>
							)}
						</g>
					}

					{ (this.props.winnerView) ? '' :
						<g transform='translate(-130 72)'>
							<text
								x={0}
								y={0}
								textAnchor='middle'
								fontSize={11}
								fill='#eee'
							>
								&#60;=50%
							</text>

							<text
								x={60}
								y={0}
								textAnchor='middle'
								fontSize={11}
								fill='#eee'
							>
								75%
							</text>

							<text
								x={120}
								y={0}
								textAnchor='middle'
								fontSize={11}
								fill='#eee'
							>
								100%
							</text>
						</g>
					}
				</g>
			</svg>
		);
	}


}