import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress, ordinalSuffixOf, congressForYear, getStateName } from '../utils/HelperFunctions';

export default class Timeline extends React.Component {

	constructor (props) {
		super(props);

		this.state = {
			selectedX: this.x()(this.props.selectedYear),
			demCount: this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin + ((this.props.partyCountForSelectedYear.demAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.demAboveMargin + ')' : '' ),
			demCountY: this.y()((this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin)/-2),
			notDemCount: (this.props.selectedYear >= 1856) ? this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin + ((this.props.partyCountForSelectedYear.repAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.repAboveMargin + ')' : '' ) : this.props.partyCountForSelectedYear.whigAboveMargin + this.props.partyCountForSelectedYear.whigBelowMargin + ((this.props.partyCountForSelectedYear.whigAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.whigAboveMargin + ')' : '' ),
			notDemCountY: this.y()((this.props.selectedYear >= 1856) ? (this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin)/2 : (this.props.partyCountForSelectedYear.whigAboveMargin + this.props.partyCountForSelectedYear.whigBelowMargin)/2),
			districtPercentY: this.getDistrictY(this.props.districtData[this.props.selectedYear]),
		};
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.selectedYear !== nextProps.selectedYear) {
			let demChange = (nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin) -(this.props.partyCountForSelectedYear.demAboveMargin + this.props.partyCountForSelectedYear.demBelowMargin),
				notDemChange = (nextProps.selectedYear >= 1856 && this.props.selectedYear < 1856 || nextProps.selectedYear < 1856 && this.props.selectedYear >= 1856) ? '' : (nextProps.selectedYear >= 1856) ? (nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin) -(this.props.partyCountForSelectedYear.repAboveMargin + this.props.partyCountForSelectedYear.repBelowMargin) : (nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin) -(this.props.partyCountForSelectedYear.whigAboveMargin + this.props.partyCountForSelectedYear.whigBelowMargin);

			d3.select(this.refs['demCount'])
				.transition()
				.duration(2000)
					.attr('y', this.y()((nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin)/-2))
					.text(((demChange > 0) ? '+' : '') + demChange);
			d3.select(this.refs['notDemCount'])
				.transition()
				.duration(2000)
					.attr('y', (notDemChange) ? this.y()((this.props.selectedYear >= 1856) ? (nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin)/2 : (nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin)/2) : 0)
					.text(((notDemChange && notDemChange > 0) ? '+' : '') + notDemChange);

			d3.select(this.refs['selectedLine']).selectAll('circle')
				.transition()
				.duration(2000)
					.attr('cy', this.getDistrictY(nextProps.districtData[nextProps.selectedYear]));				

			d3.select(this.refs['selectedLine'])
				.transition()
				.duration(2000)
					.attr('transform', 'translate(' + this.x()(nextProps.selectedYear) + ' ' + (DimensionsStore.getDimensions().timelineHorizontalGutter  + DimensionsStore.getDimensions().timelineSteamgraphGutter) + ')')
				.on('end', () => {
					this.setState({
						selectedX: this.x()(nextProps.selectedYear),
						demCountY: this.y()((nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin)/-2),
						demCount: nextProps.partyCountForSelectedYear.demAboveMargin + nextProps.partyCountForSelectedYear.demBelowMargin + ((this.props.partyCountForSelectedYear.demAboveMargin > 0) ? ' (+' + this.props.partyCountForSelectedYear.demAboveMargin + ')' : '' ),
						notDemCount: (nextProps.selectedYear >= 1856) ? nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin + ((nextProps.partyCountForSelectedYear.repAboveMargin > 0) ? ' (+' + nextProps.partyCountForSelectedYear.repAboveMargin + ')' : '' ) : nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin + ((nextProps.partyCountForSelectedYear.whigAboveMargin > 0) ? ' (+' + nextProps.partyCountForSelectedYear.whigAboveMargin + ')' : '' ),
						notDemCountY: this.y()((nextProps.selectedYear >= 1856) ? (nextProps.partyCountForSelectedYear.repAboveMargin + nextProps.partyCountForSelectedYear.repBelowMargin)/2 : (nextProps.partyCountForSelectedYear.whigAboveMargin + nextProps.partyCountForSelectedYear.whigBelowMargin)/2),
						districtPercentY: this.getDistrictY(nextProps.districtData[nextProps.selectedYear])
			
					});
				});
		}

		else if (nextProps.districtData) {
			this.setState({
				districtPercentY: this.getDistrictY(nextProps.districtData[nextProps.selectedYear])
			});
		}
	}

	x() { 
		return d3.scaleLinear()
			.domain([1824, 2016])
			.range([15, DimensionsStore.getDimensions().timelineWidth]);
	}

	y() {
		return d3.scaleLinear()
			.domain([-1*this.props.topOffset, this.props.bottomOffset])
			.range([0, DimensionsStore.getDimensions().timelineSteamgraphHeight - DimensionsStore.getDimensions().timelineSteamgraphGutter * 2]);
	}

	yDistrict() {
		return d3.scaleLinear()
			.domain([-1, -1, -0.5, 0, 0.5, 1, 1])
			.range([this.y()(this.props.bottomOffset*-1), this.y()(this.props.bottomOffset*-1), this.y()(0), this.y()(0), this.y()(0), this.y()(this.props.bottomOffset), this.y()(this.props.bottomOffset)]);
	}

	getDistrictY (districtData) {
		if (!districtData) {
			return;
		}
		let y = this.yDistrict()(1) + DimensionsStore.getDimensions().timelineAxisShortTickHeight;
		if (districtData.regularized_party_of_victory == 'third') {
			y = this.yDistrict()(0.5);
		} else if (districtData.percent_vote > 0) {
			if (districtData.regularized_party_of_victory == 'democrat') {
				y = this.yDistrict()(districtData.percent_vote * -1);
			} else if (districtData.regularized_party_of_victory == 'republican' || districtData.regularized_party_of_victory == 'whig') {
				y = this.yDistrict()(districtData.percent_vote);
			}
		}
		return y; 
	}

	render() {
		const dimensions = DimensionsStore.getDimensions();
	
		var x = this.x();
		var y = this.y();
		var yDistrict = this.yDistrict();
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
			if (this.props.districtData[year].regularized_party_of_victory !== 'third' && this.props.districtData[year].percent_vote > 0) {
				lineData.push({year: year, percent: (this.props.districtData[year].regularized_party_of_victory == 'democrat') ? this.props.districtData[year].percent_vote * -1 : this.props.districtData[year].percent_vote});
			}
		});

		const getStackColor = function(key) {
			return (key == 'demAboveMargin') ? getColorForParty('democrat') :
				(key == 'demBelowMargin') ? getColorForMargin('democrat', 0.8) :
				(key == 'thirdCount') ? getColorForParty('third') :
				(key == 'repBelowMargin') ? getColorForMargin('republican', 0.8) :
				(key == 'repAboveMargin') ? getColorForParty('republican') : 
				(key == 'whigBelowMargin') ? getColorForMargin('whig', 0.8) :
				(key == 'whigAboveMargin') ? getColorForParty('whig') : 'grey';
		};

		return (
			<svg 
				width={ dimensions.timelineWidth + DimensionsStore.getDimensions().timelineYAxisWidth }
				height={ dimensions.timelineHeight }
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
				<g transform={'translate(0 ' + (dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphHeight) + ')'}>
					<line
						x1={x(1788)}
						x2={x(2016)}
						y1={ dimensions.timelineAxisLongTickHeight }
						y2={ dimensions.timelineAxisLongTickHeight }
						stroke='white'
					/>

					{ Array.from({length: 115}, (v, i) => yearForCongress(i+1)).map(year => 
						<line
							x1={x(year)}
							x2={x(year)}
							y1={ (year%10 == 0) ? 0 : dimensions.timelineAxisLongTickHeight - dimensions.timelineAxisShortTickHeight }
							y2={ dimensions.timelineAxisLongTickHeight }
							stroke={ (year == this.props.selectedYear) ? '#F0B67F' : 'white'}
							strokeWidth={ (year == this.props.selectedYear) ? 2 : 1 }
							key={'tickFor'+year}
						/>
					)}

					{ Array.from({length: (2020-1830)/10}, (v, i) => 1830+i*10).map(year => 
						<text
							x={x(year)}
							y={ dimensions.timelineAxisHeight - 2* dimensions.timelineAxisGutter }
							textAnchor='middle'
							key={'yearFor'+year}
							fill='white'
							style={{
								fontSize: dimensions.timelineAxisFontSize
							}}
						>
							{year}
						</text>
					)}
				</g>

				{/* y axis: percent */}
				{ (this.props.districtData) ?
					<g transform={ 'translate(' + dimensions.timelineWidth + ' ' + dimensions.timelineHorizontalGutter + ')'}>
						<line
							x1={ dimensions.timelineAxisShortTickHeight }
							x2={ dimensions.timelineAxisShortTickHeight }
							y1={ yDistrict(-1) }
							y2={ yDistrict(1) }
							stroke='white'
						/>

						{ [-1, -0.75, .5, .75, 1].map(percent => 
							<g key={'ytickFor'+percent}>
								<line
									x1={0}
									x2={dimensions.timelineAxisShortTickHeight}
									y1={ yDistrict(percent) }
									y2={ yDistrict(percent) }
									stroke='white'
									
								/>
								<text
									x={dimensions.timelineAxisShortTickHeight * 2}
									y={ yDistrict(percent) + 6 }
									fill='white'

								>
									{ Math.round(Math.abs(percent * 100)) + '%' + ((percent == 0.5) ? ' or less' : '') }
								</text>
							</g>
						)}
					</g> : 
					<g transform={ 'translate(' + dimensions.timelineWidth + ' ' + dimensions.timelineHorizontalGutter + ')'}>
						<line
							x1={ dimensions.timelineAxisShortTickHeight }
							x2={ dimensions.timelineAxisShortTickHeight }
							y1={ y(this.props.topOffset * -1) }
							y2={ y(this.props.bottomOffset) }
							stroke='white'
						/>

						{ [-300, -200, -100, 0, 100, 200, 300].map(members => 
							<g key={'ytickFor'+members}>
								<line
									x1={0}
									x2={dimensions.timelineAxisShortTickHeight}
									y1={ y(members) }
									y2={ y(members) }
									stroke='white'
									
								/>
								<text
									x={dimensions.timelineAxisShortTickHeight * 2}
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
				<g transform={'translate(0 ' + (dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphGutter) + ')'}>

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

					{ (this.props.districtData) ?
						<g>
							<rect 
								x={ 0 }
								y={ 0 }
								width={ dimensions.timelineWidth }
								height={ dimensions.timelineSteamgraphHeight - dimensions.timelineSteamgraphGutter * 2 }
								fill={ '#233036' }
								fillOpacity={1}

							/>

							<rect 
								x={ 0 }
								y={ 0 }
								width={ dimensions.timelineWidth }
								height={ yDistrict(0) }
								fill={ getColorForParty('democrat') }
								fillOpacity={0.05}

							/>

							<rect 
								x={ 0 }
								y={ yDistrict(0) }
								width={ dimensions.timelineWidth }
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
								if (['democrat','republican','whig'].includes(this.props.districtData[year].regularized_party_of_victory)) {
									return (
										<circle
											cx={x(year)}
											cy={ this.getDistrictY(this.props.districtData[year]) }
											r={ 5 }
											fill={ getColorForMargin(this.props.districtData[year].regularized_party_of_victory, 1) }
											stroke={ 'transparent' }
											key={ 'districtMOVFor' + year }
										/>
									);
								} else if (this.props.districtData[year].regularized_party_of_victory == 'third') {
									return (
										<rect
											x={x(year - 1)}
											y={ 0 }
											width={x(1863) - x(1861)}
											height={ yDistrict(1) }
											fill={ getColorForParty('third') }
											fillOpacity={0.4}
										/>
									);
								}

							})}
						</g> : ''
					}
				</g>

				{/* selected */}
				<g 
					transform={'translate(' + this.state.selectedX + ' ' + (dimensions.timelineHorizontalGutter + dimensions.timelineSteamgraphGutter) + ')'}
					ref='selectedLine'
				>

					<line
						x1={0}
						x2={0}
						y1={0}
						y2={dimensions.timelineSteamgraphHeight + dimensions.timelineAxisShortTickHeight}
						stroke='#F0B67F'
						strokeWidth={2}
					/>

					{ (this.props.districtData) ?
						<circle
							cx={0}
							cy={ this.state.districtPercentY }
							r={ 7 }
							fill={ getColorForMargin(this.props.districtData[this.props.selectedYear].regularized_party_of_victory, 1) }
							stroke={ '#F0B67F' }
						/> :
						<g transform={'translate(0 ' + dimensions.timelineSteamgraphGutter + ')'}>
							<text
								x={0 - (x(1863) - x(1861))}
								y={this.state.demCountY}
								textAnchor='end'
								fill='white'
								style={{
									textShadow: '-1px 0 1px ' + getColorForMargin('democrat', 1) + ', 0 1px 1px ' + getColorForMargin('democrat', 1) + ', 1px 0 1px ' + getColorForMargin('democrat', 1) + ', 0 -1px 1px ' + getColorForMargin('democrat', 1)
								}}
								ref='demCount'
							>
								{ this.state.demCount }
							</text> : ''

							<text
								x={x(1863) - x(1861)}
								y={this.state.notDemCountY}
								textAnchor='start'
								fill='white'
								style={{
									textShadow: '-1px 0 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1) + ', 0 1px 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1) + ', 1px 0 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1) + ', 0 -1px 1px ' + getColorForMargin((this.props.selectedYear >= 1856) ? 'republican': 'whig', 1)
								}}
								ref='notDemCount'
							>
								{ this.state.notDemCount }
							</text>
						</g>
					}



					<rect
						x={x(1845) - x(1860)}
						y={ dimensions.timelineSteamgraphHeight + dimensions.timelineAxisShortTickHeight}
						width={x(1890) - x(1860)}
						height={ dimensions.timelineAxisFontSizeSelected }
						fill="url(#selectedYearBackground)"
					/>

					<text
						x={0}
						y={ dimensions.timelineSteamgraphHeight + dimensions.timelineAxisHeight - dimensions.timelineAxisShortTickHeight  }
						textAnchor='middle'
						fill='#F0B67F'
						style={{
							fontSize: dimensions.timelineAxisFontSizeSelected,
							fontWeight: 'bold'
						}}
					>
						{this.props.selectedYear}
					</text>
				</g>

				{/* clickable areas to select year */}
				{ this.props.congressYears.map(year => 
					<rect
						x={x(year)-(x(1862) - x(1861))}
						y={0}
						width={x(1862) - x(1860)}
						height={dimensions.timelineHeight}
						stroke='#999'
						strokeWidth={0}
						fill='transparent'
						key={'clickbox'+year}
						id={year}
						onClick={ this.props.onYearSelected }
					/>
				)}
			</svg>
		);
	}


}