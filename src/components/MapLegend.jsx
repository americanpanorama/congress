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

		return (
			<svg 
				width={350}
				height={150}
				id='legend'
			>

				<rect
					width={350}
					height={150}
					fill='#eee'
				/>

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

				<g 
					transform='translate(260 20)'
					onClick={ this.props.onViewSelected }
				>
					<text
						x={-10}
						textAnchor='end'
						fontSize={20}
						fill={(this.props.selectedView == 'cartogram') ? 'black' : 'grey'}
					>
						CARTOGRAM
					</text>
					<text
						x={0}
						textAnchor='middle'
						fontSize={20}
						fill='grey'
					>
						↔
					</text>
					<text
						x={10}
						textAnchor='start'
						fontSize={20}
						fill={(this.props.selectedView == 'map') ? 'black' : 'grey'}
					>
						MAP
					</text>
				</g>

				<g 
					transform='translate(260 50)'
					onClick={ this.props.toggleView}
				>
					<text
						x={-10}
						textAnchor='end'
						fontSize={20}
						fill={ (!this.props.winnerView) ? 'black' : 'grey'}
					>
						STRENGTH OF VICTORY
					</text>
					<text
						x={0}
						textAnchor='middle'
						fontSize={20}
						fill='grey'
					>
						↔
					</text>
					<text
						x={10}
						textAnchor='start'
						fontSize={20}
						fill={ (this.props.winnerView) ? 'black' : 'grey'}
					>
						WINNER
					</text>
				</g>

				<g transform='translate(200 70)'>

					<text
						x={0}
						y={12}
						textAnchor='start'
					>
						Democratic
					</text>

					{ (this.props.selectedView == 'map') ?
						<rect 
							x={ this.state.gradientX }
							y={0}
							width={ this.state.gradientWidth }
							height={15}
							fill={ this.state.demFill }
							ref='demGradient'
						/> :
						<g>
							{ ((this.props.winnerView) ? [1] : [1,0.9166,0.8333,0.75,0.666,0.5833,0.5]).map((sov,i) => 
								<circle
									cx={ -17.5 - (105/120) * (1-sov)*240 }
									cy={ 7.5 }
									r={7.5}
									fill={ getColorForMargin('democratic', sov) }
									key={'demBubble'+i}
								/>
							)}
						</g>
					}


					<text
						x={0}
						y={32}
						textAnchor='start'
					>
						Republican
					</text>

					{ (this.props.selectedView == 'map') ?
						<rect 
							x={ this.state.gradientX }
							y={20}
							width={ this.state.gradientWidth }
							height={15}
							fill={ this.state.repFill }
							ref='repGradient'
						/> :
						<g>
							{ ((this.props.winnerView) ? [1] : [1,0.9166,0.8333,0.75,0.666,0.5833,0.5]).map((sov,i) => 
								<circle
									cx={ -17.5 - (105/120) * (1-sov)*240 }
									cy={ 27.5 }
									r={7.5}
									fill={ getColorForMargin('republican', sov) }
									key={'repBubble'+i}
								/>
							)}
						</g>
					}

					<text
						x={0}
						y={52}
						textAnchor='start'
					>
						Third
					</text>

					{ (this.props.selectedView == 'map') ?
						<rect 
							x={ this.state.gradientX }
							y={40}
							width={ this.state.gradientWidth }
							height={15}
							fill={ this.state.thirdFill }
							ref='thirdGradient'
						/> :
						<g>
							{ ((this.props.winnerView) ? [1] : [1,0.9166,0.8333,0.75,0.666,0.5833,0.5]).map((sov,i) => 
								<circle
									cx={ -17.5 - (105/120) * (1-sov)*240 }
									cy={ 47.5 }
									r={7.5}
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
							>
								&#60;=50%
							</text>

							<text
								x={60}
								y={0}
								textAnchor='middle'
								fontSize={11}
							>
								75%
							</text>

							<text
								x={120}
								y={0}
								textAnchor='middle'
								fontSize={11}
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