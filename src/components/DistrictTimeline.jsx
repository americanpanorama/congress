import * as React from 'react';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore.js';
import { getColorForParty, getColorForMargin, yearForCongress, ordinalSuffixOf, congressForYear } from '../utils/HelperFunctions';

export default class DistrictTimeline extends React.Component {

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
			.domain([1836, 2010])
			.range([15, DimensionsStore.getDimensions().timelineWidth]);
		var y = d3.scaleLinear()
			.domain([-1, 1])
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
				(key == 'repAboveMargin') ? getColorForParty('republican') :
				(key == 'whigBelowMargin') ? getColorForMargin('whig', 0.8) :
				(key == 'whigAboveMargin') ? getColorForParty('whig') : 'grey';
		};

		return (
			<svg 
				width={ width }
				height={ height }
				id='districtTimeline'
			>
				<g transform={'translate(0 ' + (labelHeight + steamgraphGutter) + ')'}>

					<rect 
						x={ 0 }
						y={ 0 }
						width={ width }
						height={ steamgraphHeight - steamgraphGutter * 2 }
						fill={ '#233036' }
						fillOpacity={0.9}

					/>

					{ Object.keys(this.props.electionsData).map(year => {
						if (this.props.electionsData[year]) {
							console.log(this.props.electionsData[year].partyReg);
							return (
								<circle
									cx={x(year)}
									cy={ (this.props.electionsData[year].partyReg == 'democrat') ? y(this.props.electionsData[year].percent * -1) : (this.props.electionsData[year].partyReg == 'republican' || this.props.electionsData[year].partyReg == 'whig') ? y(this.props.electionsData[year].percent) : 0 }
									r={ 5 }
									fill={ getColorForParty(this.props.electionsData[year].partyReg) }
									key={ 'districtMOVFor' + year }
								/>
							);
						}

					})}


				</g>


			</svg>
		);
	}


}