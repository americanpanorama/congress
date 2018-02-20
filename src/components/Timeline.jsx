import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress } from '../utils/HelperFunctions';

export default class Timeline extends React.Component {

	render() {

		var y = d3.scaleLinear()
			.domain([2014, 1790])
			.range([DimensionsStore.getDimensions().timelineHeight - 50, 0]);
		var x = d3.scaleLinear()
			.domain([-350, 350])
			.range([-125, 125]);
		var area = d3.area()
			.y(d => y(d.data.year))
			.x0(d => x(d[0]))
			.x1(d => x(d[1]))
			.curve(d3.curveCatmullRom);

		return (
			<svg 
				width={350}
				height={ DimensionsStore.getDimensions().timelineHeight}
			>

				<g transform='translate(175 0)'>
					<rect
						x={x(-250)}
						y={ 0 }
						width={ x(75) }
						height={ 20 }
						fill={ getColorForMargin('democrat', 1)}
					/>
					<rect
						x={x(-175)}
						y={ 0 }
						width={ x(125) }
						height={ 20 }
						fill={ getColorForMargin('democrat', 0.8)}
					/>
					<rect
						x={x(-50)}
						y={ 0 }
						width={ x(100) }
						height={ 20 }
						fill={getColorForMargin('Third', 1)}
					/>
					<rect
						x={x(50)}
						y={ 0 }
						width={ x(125) }
						height={ 20 }
						fill={ getColorForMargin('republican', 0.8)}
					/>
					<rect
						x={x(175)}
						y={ 0 }
						width={ x(75) }
						height={ 20 }
						fill={ getColorForMargin('republican', 1) }
					/>

					<text
						x={x(-240)}
						y={ 14 }
						textAnchor='start'
						fill='white'
						fontSize={ 12 }
					>
						Democrat
					</text>

					<text
						x={x(0)}
						y={ 14 }
						textAnchor='middle'
						fill='white'
						fontSize={ 12 }
					>
						3rd
					</text>

					<text
						x={x(240)}
						y={ 14 }
						textAnchor='end'
						fill='white'
						fontSize={ 12 }
					>
						Republican
					</text>

					<line
						x1={x(-212)}
						x2={x(212)}
						y1={30}
						y2={30}
						stroke='#222'
					/>

					<line
						x1={x(-212)}
						x2={x(-212)}
						y1={25}
						y2={30}
						stroke='#222'
					/>

					<line
						x1={x(212)}
						x2={x(212)}
						y1={25}
						y2={30}
						stroke='#222'
					/>

				<defs>
					<filter x="0" y="0" width="1" height="1" id="solid">
						<feFlood floodColor="white"/>
						<feComposite in="SourceGraphic"/>
					</filter>
				</defs>

					<text
						x={x(0)}
						y={ 35 }
						textAnchor='middle'
						fill='black'
						filter="url(#solid)" 
					>
						strength of majority
					</text>
				</g>

				<g transform='translate(50 50)'>
					<line
						transform={'translate(' + x(350) + ')'}
						x1={0}
						x2={x(300)}
						y1={17}
						y2={17}
						stroke='#222'
					/>

					{ [0,100,200,300].map(count => 
						<g transform={'translate(' + x(350) + ')'} key={ 'timelineTick'+ count }>
							<line
								x1={x(count)}
								x2={x(count)}
								y1={14}
								y2={17}
								stroke='#222'
							/>
							<text
								x={x(count)}
								y={12}
								fontSize={12}
								textAnchor='middle'
							>
								{count}
							</text>
						</g>
					)}

					<text
						x={x(320)}
						y={15}
						fontSize={12}
						textAnchor='end'
					>
						# of Representatives
					</text>
				</g>



				<g transform='translate(175 100)'>

				{ this.props.partyCount.map((partyCount, i) => 
					<path
						d={area(partyCount)}
						fill={(i < 10) ? getColorForParty('democrat') : (i == 19) ? getColorForMargin('democrat', 0.8) : (i == 20) ? 'green' : (i == 21) ? getColorForMargin('republican', 0.8) : getColorForParty('republican')}
						key={'timelineParty' + i}
					/>
				)}

				<text
					x={x(0 - this.props.partyCountForSelectedYear.demAboveMargin - this.props.partyCountForSelectedYear.demBelowMargin) - 5}
					y={y(this.props.selectedYear)}
					textAnchor='end'
					fill='black'
				>
					{ this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin}
				</text> : ''

				{ (this.props.partyCountForSelectedYear.demAboveMargin > 0) ?
					<text
						x={x(0 - this.props.partyCountForSelectedYear.demAboveMargin - this.props.partyCountForSelectedYear.demBelowMargin) - 5}
						y={y(this.props.selectedYear) + 15}
						textAnchor='end'
						fill='black'
						fontSize={11}
					>
						{ '(+' + this.props.partyCountForSelectedYear.demAboveMargin + ')' }
					</text> : ''
				}

				<text
					x={x(this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin) + 5}
					y={y(this.props.selectedYear)}
					textAnchor='start'
					fill='black'
				>
					{ this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin }
				</text> : ''



				{ (this.props.partyCountForSelectedYear.repAboveMargin > 0) ?
					<text
						x={x(this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin) + 5}
						y={y(this.props.selectedYear) + 15}
						textAnchor='start'
						fill='black'
						fontSize={11}
					>
						{ '(+' + this.props.partyCountForSelectedYear.repAboveMargin + ')' }
					</text> : ''
				}
				

				{ this.props.congressYears.map(year => 
					<text
						x={0}
						y={y(year)}
						fill='white'
						textAnchor='middle'
						key={'year' + year}
						fontSize={ (year == this.props.selectedYear) ? 20 : 10 }
					>
						{(year == this.props.selectedYear || year %10 == 0) ? year : '•'}
					</text>
				)}

				{ this.props.congressYears.map(year => 
					<rect
						x={-200}
						y={y(year)}
						width={400}
						height={y(1862) - y(1860)}
						stroke='#999'
						strokeWidth={0}
						fill='transparent'
						key={'clickbox'+year}
						id={year}
						onClick={ this.props.onYearSelected }
					/>
				)}

				</g>
			</svg>
		);
	}


}