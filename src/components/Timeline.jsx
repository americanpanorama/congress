import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress, ordinalSuffixOf, congressForYear, getStateName } from '../utils/HelperFunctions';

export default class Timeline extends React.Component {

	render() {

		const height = DimensionsStore.getDimensions().timelineHeight,
			width = DimensionsStore.getDimensions().timelineWidth,
			infoWidth = 0,
			horizontalGutter = height * 1/12,

			steamgraphHeight = height * 9/12,
			steamgraphGutter = steamgraphHeight * 0.02,

			axisHeight = height * 2/12,
			axisGutter = axisHeight * 1/12,
			axisLongTickHeight = axisHeight * 3/12,
			axisShortTickHeight = axisHeight * 2/12,
			axisFontSize = axisHeight * 6/12,
			axisFontSizeSelected = axisHeight * 9/12,

			electionFontSize = horizontalGutter * 7/12,
			congressFontSize = horizontalGutter * 5/12;
  			
		var x = d3.scaleLinear()
			.domain([1824, 2016])
			.range([15, DimensionsStore.getDimensions().timelineWidth]);
		var y = d3.scaleLinear()
			.domain([-1*this.props.topOffset, this.props.bottomOffset])
			.range([0, steamgraphHeight - steamgraphGutter * 2]);
		var yDistrict = d3.scaleLinear()
			.domain([-1, -1, -0.5, 0, 0.5, 1, 1])
			.range([y(this.props.bottomOffset*-1), y(this.props.bottomOffset*-1), y(0), y(0), y(0), y(this.props.bottomOffset), y(this.props.bottomOffset)]);
		var area = d3.area()
			.x(d => x(d.data.year))
			.y0(d => y(d[0]))
			.y1(d => y(d[1]))
			.curve(d3.curveCatmullRom);

		var line = d3.line()
			.x(function(d) { return x(d.year); }) // set the x values for the line generator
			.y(function(d) { return yDistrict(d.percent); }) // set the y values for the line generator 
			.curve(d3.curveCatmullRom); // apply smoothing to the line

		let lineData = [];
		Object.keys(this.props.districtData).forEach(year => {
			lineData.push({year: year, percent: (this.props.districtData[year].regularized_party_of_victory == 'democrat') ? this.props.districtData[year].percent_vote * -1 : this.props.districtData[year].percent_vote});
		});

		const getStackColor = function(key) {
			return (key == 'demAboveMargin') ? getColorForParty('democrat') :
				(key == 'demBelowMargin') ? getColorForMargin('democrat', 0.8) :
				(key == 'thirdCount') ? getColorForParty('third') :
				(key == 'repBelowMargin') ? getColorForMargin('republican', 0.8) :
				(key == 'repAboveMargin') ? getColorForParty('republican') : 'grey';
		};

		return (
			<svg 
				width={ width + DimensionsStore.getDimensions().timelineYAxisWidth }
				height={ height }
			>

				<defs>
					<linearGradient id="selectedYearBackground">
						<stop offset="0%"  stopColor="#233036" stopOpacity='0' />
						<stop offset="33%" stopColor="#233036" stopOpacity='1' />
						<stop offset="67%" stopColor="#233036" stopOpacity='1' />
						<stop offset="100%"  stopColor="#233036" stopOpacity='0' />
					</linearGradient>
				</defs>


				{/* x axis: years */}
				<g transform={'translate(0 ' + (horizontalGutter + steamgraphHeight) + ')'}>
					<line
						x1={x(1788)}
						x2={x(2016)}
						y1={ axisLongTickHeight }
						y2={ axisLongTickHeight }
						stroke='white'
					/>

					{ Array.from({length: 115}, (v, i) => yearForCongress(i+1)).map(year => 
						<line
							x1={x(year)}
							x2={x(year)}
							y1={ (year%10 == 0) ? 0 : axisLongTickHeight - axisShortTickHeight }
							y2={ axisLongTickHeight }
							stroke={ (year == this.props.selectedYear) ? '#F0B67F' : 'white'}
							strokeWidth={ (year == this.props.selectedYear) ? 2 : 1 }
							key={'tickFor'+year}
						/>
					)}

					{ Array.from({length: (2020-1830)/10}, (v, i) => 1830+i*10).map(year => 
						<text
							x={x(year)}
							y={ axisHeight - 2* axisGutter }
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

					<rect
						x={x(this.props.selectedYear - 15)}
						y={ axisLongTickHeight + axisGutter  }
						width={x(1890) - x(1860)}
						height={ axisFontSizeSelected }
						fill="url(#selectedYearBackground)"
					/>

					<text
						x={x(this.props.selectedYear)}
						y={ axisHeight  }
						textAnchor='middle'
						fill='#F0B67F'
						style={{
							fontSize: axisFontSizeSelected,
							fontWeight: 'bold'
						}}
					>
						{this.props.selectedYear}
					</text>
				</g>

				{/* y axis: percent */}
				{ (this.props.districtData) ?
					<g transform={ 'translate(' + width + ' ' + horizontalGutter + ')'}>
						<line
							x1={ axisShortTickHeight }
							x2={ axisShortTickHeight }
							y1={ yDistrict(-1) }
							y2={ yDistrict(1) }
							stroke='white'
						/>

						{ [-1, -0.75, .5, .75, 1].map(percent => 
							<g key={'ytickFor'+percent}>
								<line
									x1={0}
									x2={axisShortTickHeight}
									y1={ yDistrict(percent) }
									y2={ yDistrict(percent) }
									stroke='white'
									
								/>
								<text
									x={axisShortTickHeight * 2}
									y={ yDistrict(percent) + 6 }
									fill='white'

								>
									{ Math.round(Math.abs(percent * 100)) + '%' + ((percent == 0.5) ? ' or less' : '') }
								</text>
							</g>
						)}
					</g> : 
					<g transform={ 'translate(' + width + ' ' + horizontalGutter + ')'}>
						<line
							x1={ axisShortTickHeight }
							x2={ axisShortTickHeight }
							y1={ y(this.props.topOffset * -1) }
							y2={ y(this.props.bottomOffset) }
							stroke='white'
						/>

						{ [-300, -200, -100, 0, 100, 200, 300].map(members => 
							<g key={'ytickFor'+members}>
								<line
									x1={0}
									x2={axisShortTickHeight}
									y1={ y(members) }
									y2={ y(members) }
									stroke='white'
									
								/>
								<text
									x={axisShortTickHeight * 2}
									y={ y(members) + 6 }
									fill='white'
								>
									{ Math.abs(members) }
								</text>
							</g>
						)}
					</g>
				}

				{/* steamgraph data */}
				<g transform={'translate(0 ' + (horizontalGutter + steamgraphGutter) + ')'}>

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

					{ (this.props.districtData) ?
						<g>
							<rect 
								x={ 0 }
								y={ 0 }
								width={ width }
								height={ steamgraphHeight - steamgraphGutter * 2 }
								fill={ '#233036' }
								fillOpacity={1}

							/>

							<rect 
								x={ 0 }
								y={ 0 }
								width={ width }
								height={ yDistrict(0) }
								fill={ getColorForParty('democrat') }
								fillOpacity={0.05}

							/>

							<rect 
								x={ 0 }
								y={ yDistrict(0) }
								width={ width }
								height={ yDistrict(1) - yDistrict(0) }
								fill={ getColorForParty('republican') }
								fillOpacity={0.05}

							/>

							<path
								d={line(lineData)}
								stroke='white'
								strokeWidth={2}
								fill="transparent"
							/>

							{ Object.keys(this.props.districtData).map(year => {
								return (
									<circle
										cx={x(year)}
										cy={ (this.props.districtData[year].regularized_party_of_victory == 'democrat') ? yDistrict(this.props.districtData[year].percent_vote * -1) : (this.props.districtData[year].regularized_party_of_victory == 'republican') ? yDistrict(this.props.districtData[year].percent_vote) : 0 }
										r={ (year == this.props.selectedYear) ? 7 : 5 }
										fill={ getColorForMargin(this.props.districtData[year].regularized_party_of_victory, 1) }
										stroke={ (year == this.props.selectedYear) ? 'white' : 'transparent' }
										key={ 'districtMOVFor' + year }
									/>
								);
							})}

						{/* JSX Comment
							<text
								x={x(this.props.selectedYear)}
								y={ (this.props.districtData[this.props.selectedYear].regularized_party_of_victory == 'democrat') ? yDistrict(this.props.districtData[this.props.selectedYear].percent_vote * -1) + 5 : (this.props.districtData[this.props.selectedYear].regularized_party_of_victory == 'republican') ? yDistrict(this.props.districtData[this.props.selectedYear].percent_vote) : 0 }
								fill='white'
								textAnchor='middle'

							>
								{ Math.round(this.props.districtData[this.props.selectedYear].percent_vote * 100) + '%' }
							</text>
						 */}


						</g> : ''

					}



				</g>

				{/* labels and marker for selected year 
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
					y={ horizontalGutter - labelGutter}
					fill='white'
					textAnchor='middle'
					style={{
						fontSize: congressFontSize
					}}
				>
					The { ordinalSuffixOf(congressForYear(this.props.selectedYear)) } Congress
				</text>

				*/}

				<line
					x1={x(this.props.selectedYear)}
					x2={x(this.props.selectedYear)}
					y1={ horizontalGutter }
					y2={ horizontalGutter + steamgraphHeight }
					stroke='#F0B67F'
					strokeWidth={2}
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

				{/* info */}
			{/* JSX Comment 
				<g>
					<rect
						x={0}
						y={0}
						width={height}
						height={height}
						fill='black'
					/>

					<text
						x={height/2}
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
						x={height/2}
						y={ horizontalGutter - labelGutter}
						fill='white'
						textAnchor='middle'
						style={{
							fontSize: congressFontSize
						}}
					>
						The { ordinalSuffixOf(congressForYear(this.props.selectedYear)) } Congress
					</text>


					{ (this.props.districtData) ?
						<g>
							<text
								x={height/2}
								y={ horizontalGutter + congressFontSize * 1.2 }
								fill='white'
								textAnchor='middle'
								style={{
									fontSize: congressFontSize
								}}
							>
								{ getStateName(this.props.districtData[this.props.selectedYear].state) + ' ' + this.props.districtData[this.props.selectedYear].district }
							</text>

							<text
								x={height/2}
								y={ horizontalGutter + congressFontSize * 1.2 }
								fill='white'
								textAnchor='middle'
								style={{
									fontSize: congressFontSize
								}}
							>
								{ getStateName(this.props.districtData[this.props.selectedYear].state) + ' ' + this.props.districtData[this.props.selectedYear].district }
							</text>
						</g> : ''
					}
				</g> */}

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