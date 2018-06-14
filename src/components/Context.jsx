import * as React from 'react';
import PropTypes from 'prop-types';

export default class Context extends React.Component {
  constructor (props) {
    super(props);

    // bind handlers
    const handlers = ['toggleFlippedPartyOff', 'selectPartyFlippedOff'];
    handlers.forEach(handler => (this[handler] = this[handler].bind(this)));
  }

  toggleFlippedPartyOff () {
    this.props.onPartySelected(null);
    this.props.toggleFlipped();
  }

  selectPartyFlippedOff (id) {
    this.props.onPartySelected(id);
    this.props.toggleFlipped(false);
  }

  render () {
    const { dimensions } = this.props;
    return (
      <div
        id='sidebar'
        style={{
          width: dimensions.sidebarWidth,
          height: dimensions.sidebarHeight,
          left: dimensions.sidebarLeft,
          bottom: dimensions.sidebarBottom
        }}
        className='context'
      >
        {(this.props.selectedYear === 1950) &&
          <p>In the 1950 elections, both chambers of Congress shifted in favor of the Republicans. Democrats maintained a narrow majority of 48 seats in the Senate, while Republicans controlled 47 and there was a single independent. Meanwhile, the Democrats <span onClick={this.toggleFlippedPartyOff}>lost nearly thirty seats</span> in the House, but maintained <span onClick={this.selectPartyFlippedOff} id='democrat'>a majority of 234</span>. <span onClick={this.selectPartyFlippedOff} id='republican'>Republicans held 199</span>, while <span onClick={this.selectPartyFlippedOff} id='third'>Independents held 2</span>.  Future President Richard Nixon (R-CA) won the election for Senator of California, rising from the House of Representatives. Increasing anxieties about the Cold War contributed to a Red Scare where government officials accused and harassed leftist organizations and individuals under the banner of anti-communism.</p>
        }
        {(this.props.selectedYear === 1952) &&
          <p>Republicans took control of both houses of Congress in the 1952 elections, along with the presidency.  Republicans took a narrow 48-46 majority in the Senate, with two independents. The GOP held a similarly narrow margin in the House with <span onClick={this.selectPartyFlippedOff} id='republican'>221 seats</span> to <span onClick={this.selectPartyFlippedOff} id='democrat'>213 Democrats</span> and <span onClick={this.selectPartyFlippedOff} id='third'>a single independent</span>. The election revolved around the continuing war in Korea, as well as debates over the Taft-Hartley Act, which limited the reach of unions.</p>
        }
        {(this.props.selectedYear === 1954) &&
          <p>Democrats regained control of both chambers of Congress in these midterm elections.  In the Senate, they reclaimed a narrow majority of 48-47, along with a single independent. Democrats would hold this majority in the Senate until the election of 1980.  In the House, <span onClick={this.selectPartyFlippedOff} id='democrat'>Democrats regained their majority, 232-203</span>, and would hold it until the election of 1994. The 1954 elections centered in large part around the House Un-American Activities Committee (HUAC) and the excesses of Senator Joseph McCarthy's continuing accusations of Communists in the federal government. Within a week of the election, the Senate began debate of McCarthy’s censure and censured him less than a month after the November elections. <span onClick={this.props.onDistrictSelected} id='048083085004'>Sam Rayburn</span> (D-TX) resumed the position of Speaker of the House, which he had held twice before.</p>
        }
        {(this.props.selectedYear === 1956) &&
          <p>Democrats gained seats in both chambers of Congress, while Eisenhower won re-election to the Presidency in 1956.  Democrats narrowly increased their majority in the Senate by a seat to 49-47.  In the House, Democrats <span onClick={this.toggleFlippedPartyOff}>increased their majority from 29 seats to 33 seats</span>, 234-201. This was the last election prior to Alaska and Hawaii's admission to the union. The election centered around the flagging economy and the continued presence of American troops in Korea following the armistice.</p>
        }
        {(this.props.selectedYear === 1958) && 
          <p>Democrats again increased their majorities in both chambers of Congress in the landslide election of 1958.  In the Senate, the Democrats’ 2-seat majority grew to a 64-34 advantage. In the House, <span onClick={this.toggleFlippedPartyOff}>Democrats gained nearly 50 seats</span>, bringing <span onClick={this.selectPartyFlippedOff} id='democrat'>their total to 283</span> against <span onClick={this.selectPartyFlippedOff} id='republican'>153 Republicans</span>, while receiving more than 5 million more votes than Republicans nationwide. Concern over the launch of Sputnik, the Soviet Union’s space satellite, along with recession of 1958, the first major economic downturn since the end of World War II, contributed to the Democratic victory.</p>
        }
        {(this.props.selectedYear === 1960) && 
          <p>1960 was the first election in which citizens voted in all fifty of the current states. Congress had officially declared Alaska a state on January 3, 1959 and Hawaii a state on August 21, 1959. Because of this, the 87th Congress was the only Congress to have 437 representatives, until reapportionment after the 1960 census. The Senate leaned heavily Democratic, as Dems controlled the Senate 64-36, and controlled the House of Representatives 262-175. <span onClick={this.props.onDistrictSelected} id='048086087004'>Sam Rayburn</span> (D-TX) retained the speakership until his death in November 1961, when he was succeeded by <span onClick={this.props.onDistrictSelected} id='025078087012'>John McCormack</span> (D-MA).</p>
        }
        {(this.props.selectedYear === 1990) &&
          <p>The 1990 Congressional mid-term elections revolved around two major issues: growing tensions in the Persian Gulf and President George H. W. Bush's acceptance of a tax increase as part of that year's budget negotiations. Democrats retained control of both the House and Senate, gaining one Senate seat for an advantage of 56 to Republicans 44. In the House, Tom Foley (D-WA) remained Speaker of the House as Democrats <span onClick={this.toggleFlippedPartyOff}>picked up seven seats</span> for <span onClick={this.selectPartyFlippedOff} id='democrat'>a total of 267</span>, while the Republicans lost nine for <span onClick={this.selectPartyFlippedOff} id='republican'>167 total seats</span>. In Vermont, Bernard Sanders won the state’s at-large House seat for the first time, <span onClick={this.selectPartyFlippedOff} id='third'>the chamber’s lone independent</span>.</p>
        }
        {(this.props.selectedYear === 1994) &&
          <p>In the 1994 mid-term election, Republicans won control of both the House and the Senate for the first time since 1946. They gained almost ten seats in the Senate, claiming a slim majority of 52 to Democrats' 48. In the House, meanwhile, the <span onClick={this.toggleFlippedPartyOff}>Republicans gained 54 seats</span>, bringing <span onClick={this.selectPartyFlippedOff} id='republican'>their total in the chamber to 230</span>, while <span onClick={this.selectPartyFlippedOff} id='democrat'>Democrats held 204</span>.  Bernard Sanders of Vermont remained the <span onClick={this.selectPartyFlippedOff} id='third'>sole independent</span> in Congress. The elections saw Republicans gaining near parity in representation with Democrats in the South for the first time.</p>
        }
      </div>
    );
  }
}

Context.propTypes = {
  onPartySelected: PropTypes.func.isRequired,
  toggleFlipped: PropTypes.func.isRequired,
  onDistrictSelected: PropTypes.func.isRequired,
  selectedYear: PropTypes.number.isRequired,
  dimensions: PropTypes.shape({
    sidebarWidth: PropTypes.number.isRequired,
    sidebarHeight: PropTypes.number.isRequired,
    sidebarLeft: PropTypes.number.isRequired,
    sidebarBottom: PropTypes.number.isRequired
  }).isRequired
};
