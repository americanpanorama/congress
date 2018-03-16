import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress, ordinalSuffixOf, congressForYear } from '../utils/HelperFunctions';

export default class Timeline extends React.Component {

	render() {

		const height = DimensionsStore.getDimensions().timelineHeight,
			width = DimensionsStore.getDimensions().timelineWidth,
			timelineGutter = height * 0.02,
			labelHeight = DimensionsStore.getDimensions().timelineHeight / 6,
			labelGutter = labelHeight * 0.02,
			axisHeight = DimensionsStore.getDimensions().timelineHeight / 12,
			axisGutter = axisHeight * 0.02,
			steamgraphHeight = height * 3/4 - labelGutter,
			steamgraphGutter = steamgraphHeight * 0.02,
			electionFontSize = labelHeight * 7/12 - labelGutter * 1.5,
			congressFontSize = labelHeight * 5/12 - labelGutter * 1.5,
			axisFontSize = axisHeight * 3/4 - axisGutter * 1.5,
			axisTickHeight = axisHeight * 1/4 - axisGutter * 1.5;
  			
		var x = d3.scaleLinear()
			.domain([1788, 2016])
			.range([15, DimensionsStore.getDimensions().timelineWidth]);
		var y = d3.scaleLinear()
			.domain([-1*this.props.topOffset, this.props.bottomOffset])
			.range([0, steamgraphHeight - steamgraphGutter * 2]);
		var area = d3.area()
			.x(d => x(d.data.year))
			.y0(d => y(d[0]))
			.y1(d => y(d[1]))
			.curve(d3.curveCatmullRom);

		const getStackColor = function(key) {
			return (key == 'demAboveMargin') ? getColorForParty('democrat') :
				(key == 'demBelowMargin') ? getColorForMargin('democrat', 0.8) :
				(key == 'thirdCount') ? getColorForParty('third') :
				(key == 'repBelowMargin') ? getColorForMargin('republican', 0.8) :
				(key == 'repAboveMargin') ? getColorForParty('republican') : 'grey';
		};

		return (
			<svg 
				width={ width }
				height={ height }
			>
				{/* x axis: years */}
				<g transform={'translate(0 ' + (labelHeight+steamgraphHeight) + ')'}>
					<line
						x1={x(1788)}
						x2={x(2016)}
						y1={ axisTickHeight }
						y2={ axisTickHeight }
						stroke='white'
					/>

					{ Array.from({length: 115}, (v, i) => yearForCongress(i+1)).map(year => 
						<line
							x1={x(year)}
							x2={x(year)}
							y1={0}
							y2={ axisTickHeight }
							stroke='white'
							key={'tickFor'+year}
						/>
					)}

					{ Array.from({length: (2020-1790)/10}, (v, i) => 1790+i*10).map(year => 
						<text
							x={x(year)}
							y={ axisHeight - axisGutter }
							textAnchor='middle'
							key={'yearFor'+year}
							fill='white'
							style={{
								fontSize: axisFontSize
							}}
						>
							{year}
						</text>
					)}
				</g>

				{/* steamgraph data */}
				<g transform={'translate(0 ' + (labelHeight + steamgraphGutter) + ')'}>

					{ this.props.partyCount.map((partyCount, i) => 
						<path
							d={area(partyCount)}
							fill={(i < 10) ? getColorForParty('democrat') : (i == 19) ? getColorForMargin('democrat', 0.8) : (i == 20) ? 'green' : (i == 21) ? getColorForMargin('republican', 0.8) : getColorForParty('republican')}
							fill={ getStackColor(this.props.partyCountKeys[i]) }
							key={'timelineParty' + i}
							stroke={getColorForMargin('democrat', 0.5)}
							strokeWidth={1}
							strokeOpacity={0.5}
						/>
					)}

					<text
						x={x(this.props.selectedYear) - 4}
						y={y((this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin)/-2)}
						textAnchor='end'
						fill='white'
						style={{
							textShadow: '-1px 0 1px ' + getColorForMargin('democrat', 1) + ', 0 1px 1px ' + getColorForMargin('democrat', 1) + ', 1px 0 1px ' + getColorForMargin('democrat', 1) + ', 0 -1px 1px ' + getColorForMargin('democrat', 1)
						}}
					>
						{ this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin + ((this.props.partyCountForSelectedYear.demAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.demAboveMargin + ')' : '' )}
					</text> : ''

					<text
						x={x(this.props.selectedYear) + 4}
						y={y((this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin)/2)}
						textAnchor='start'
						fill='white'
						style={{
							textShadow: '-1px 0 1px ' + getColorForMargin('republican', 1) + ', 0 1px 1px ' + getColorForMargin('republican', 1) + ', 1px 0 1px ' + getColorForMargin('republican', 1) + ', 0 -1px 1px ' + getColorForMargin('republican', 1)
						}}
					>
						{ this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin + ((this.props.partyCountForSelectedYear.repAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.repAboveMargin + ')' : '' )}
					</text>
				</g>

				{/* labels and marker for selected year */}
				<text
					x={x(this.props.selectedYear)}
					y={electionFontSize + labelGutter}
					fill='white'
					textAnchor='middle'
					style={{
						fontSize: electionFontSize,
						fontFamily: 'PT Serif'
					}}

				>
					{ this.props.selectedYear + ' Election' }
				</text>

				<text
					x={x(this.props.selectedYear)}
					y={ labelHeight - labelGutter}
					fill='white'
					textAnchor='middle'
					style={{
						fontSize: congressFontSize
					}}
				>
					The { ordinalSuffixOf(congressForYear(this.props.selectedYear)) } Congress
				</text>

				<line
					x1={x(this.props.selectedYear)}
					x2={x(this.props.selectedYear)}
					y1={ labelHeight }
					y2={ labelHeight + steamgraphHeight }
					stroke='white'
				/>

				{/* clickable areas to select year */}
				{ this.props.congressYears.map(year => 
					<rect
						x={x(year)-(x(1862) - x(1861))}
						y={0}
						width={x(1862) - x(1860)}
						height={height}
						stroke='#999'
						strokeWidth={0}
						fill='transparent'
						key={'clickbox'+year}
						id={year}
						onClick={ this.props.onYearSelected }
					/>
				)}

				{/* JSX Comment 
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
						fill='white'
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

				*/}


			</svg>
		);
	}


}