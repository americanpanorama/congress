import * as React from 'react';

import ReactDOM from 'react-dom';
import * as d3 from "d3"
import DimensionsStore from '../stores/DimensionsStore.js';

export default class Context extends React.Component {

  constructor (props) { 
  	super(props); 

      // bind handlers
    const handlers = ['toggleFlippedPartyOff','selectPartyFlippedOff'];
    handlers.forEach(handler => { this[handler] = this[handler].bind(this); });
  }

  toggleFlippedPartyOff() {
  	this.props.onPartySelected(null);
  	this.props.toggleFlipped();
  }

  selectPartyFlippedOff(id) {
  	this.props.onPartySelected(id);
  	this.props.toggleFlipped(false);
  }

  render() {

	return(
  		<div  className='context'>
  			{ (parseInt(this.props.selectedYear) == 1990) ?
  				<p>The 1990 Congressional mid-term elections revolved around two major issues: growing tensions in the Persian Gulf and President George H. W. Bush's acceptance of a tax increase as part of that year's budget negotiations. Democrats retained control of both the House and Senate, gaining one Senate seat for an advantage of 56 to Republicans 44. In the House, Tom Foley (D-WA) remained Speaker of the House as Democrats <span onClick={this.toggleFlippedPartyOff}>picked up seven seats</span> for <span onClick={this.selectPartyFlippedOff} id='democrat'>a total of 267</span>, while the Republicans lost nine for <span onClick={this.selectPartyFlippedOff} id='republican'>167 total seats</span>. In Vermont, Bernard Sanders won the state’s at-large House seat for the first time, <span onClick={this.selectPartyFlippedOff} id='third'>the chamber’s lone independent</span>.</p> : ''
  			}
  			{ (parseInt(this.props.selectedYear) == 1994) ?
  				<p>In the 1994 mid-term election, Republicans won control of both the House and the Senate for the first time since 1946. They gained almost ten seats in the Senate, claiming a slim majority of 52 to Democrats' 48. In the House, meanwhile, the <span onClick={this.toggleFlippedPartyOff}>Republicans gained 54 seats</span>, bringing <span onClick={this.selectPartyFlippedOff} id='republican'>their total in the chamber to 230</span>, while <span onClick={this.selectPartyFlippedOff} id='democrat'>Democrats held 204</span>.  Bernard Sanders of Vermont remained the <span onClick={this.selectPartyFlippedOff} id='third'>sole independent</span> in Congress. The elections saw Republicans gaining near parity in representation with Democrats in the South for the first time.</p> : ''
  			}
  		</div>
  	);t
  }

}