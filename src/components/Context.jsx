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
        {(this.props.selectedYear === 1930) &&
          <p>Voters turned Republicans out of office across the country as the electorate rejected conservative approaches to the Great Depression.  <span onClick={this.toggleFlippedPartyOff}>Democrats picked up 52 seats</span> in the election, barely missing taking control of the House, 216-218.  However, several special elections after the death of elected members led to Democratic control of the House, 218-217.  <span onClick={this.props.onDistrictSelected} id='048066072015'>John Nance Garner</span> (D-TX) succeeded <span onClick={this.props.onDistrictSelected} id='039064072001'>Nicholas Longworth</span> (R-OH) as Speaker of the House.  In the Senate, Democrats picked up 6 seats but Republicans retained control of the chamber, 50-45.</p>
        }
        {(this.props.selectedYear === 1932) &&
          <p>The electoral wave rejecting the Republican party continued in 1932, when <span onClick={this.toggleFlippedPartyOff}>Democrats picked up 97 seats</span> in the House to take a 313-117 advantage, with the Farmer-Labor party gaining 4 more seats for a total of 5.  <span onClick={this.props.onDistrictSelected} id='017063077020'>Henry Rainey</span> (D-IL) replaced <span onClick={this.props.onDistrictSelected} id='048073073015'>John Garner</span> (D-TX) as Speaker when Garner became Vice President.  In the Senate, Democrats gained 12 seats to take control, 59-36.</p>
        }
        {(this.props.selectedYear === 1934) &&
          <p>Voters largely approved of the wave of New Deal legislation and programs to address the Great Depression returning control to Democrats in the House and <span onClick={this.toggleFlippedPartyOff}>adding 9 more seats</span> than in 1932, for an advantage over Republicans of 322-103. <span onClick={this.props.onDistrictSelected} id='047074077005'>Joseph Byrns</span> (D-TN) succeeded Henry Rainey (D-IL) as Speaker of the House, until Byrns died in 1936, when <span onClick={this.props.onDistrictSelected} id='001073087007'>William Bankhead</span> (D-AL) assumed the Speakership.  The Progressive Party won 7 seats, and the Farm-Laborer Party dropped to 3 seats in the House.  In the Senate, Democrats picked up 9 seats to take a 69-25 advantage in the chamber.  The Progressive and Farmer-Labor parties each won 1 Senate seat.</p>
        }
        {(this.props.selectedYear === 1936) &&
          <p>Democrats strengthened their hold on the House of Representatives in 1936 campaigning on consolidation and protection of the New Deal.  Democrats <span onClick={this.toggleFlippedPartyOff}>picked up 12 seats</span> to take a 334-88 advantage in the House.  In the Senate, Democrats gained 5 seats and increased their advantage over Republicans, 74-17, while Farmer-Labor remained at 2 seats, the Progressive Party at 1 seat, and 1 Independent won a seat.</p>
        }
        {(this.props.selectedYear === 1938) &&
          <p>The 1938 elections saw a resurgence of the Republican Party, as the GOP <span onClick={this.toggleFlippedPartyOff}>picked up 81 seats</span> in the House of Representatives to cut the Democratic advantage to 262-169.  The Progressive and Farmer-Labor parties lost seats, dropping to 2 and 1, respectively, while the American Labor party won a single seat.  In the Senate, Republicans picked up 7 seats to cut the Democratic control to a 68-23 advantage, with the Farmer-Labor party holding 2 seats, Progressives 1, and 1 Independent.</p>
        }
        {(this.props.selectedYear === 1940) &&
          <p>Democrats held their support in the fall of 1940 as economic growth returned after the recession of 1937. The continuing isolationism of the nation, despite the growing war in Europe, meant that mobilization was not a decisive issue for this election.  <span onClick={this.toggleFlippedPartyOff}>Democrats picked up 5 seats</span> in the House to increase their advantage to 267-162.  <span onClick={this.selectPartyFlippedOff} id='third'>Minor parties held six seats</span>, including 3 for the Progressive party, 1 for American Labor, 1 for Farmer-Labor, and one Independent.  In the Senate, Republicans picked up 3 seats, but Democrats retained control of the chamber, 66-27.  The Progressive and Farmer-Labor parties each won one seat.</p>
        }
        {(this.props.selectedYear === 1942) &&
          <p>Republicans made significant gains in the 1942 elections as the reform and economic recovery of the New Deal wound down, replaced by appropriations and mobilization for World War II.  <span onClick={this.toggleFlippedPartyOff}>Republicans picked up 47 seats in the House</span> to cut Democratic control to a narrow 222-209 advantage.  In the Senate, Republicans picked up 9 seats to cut the Democratic advantage to 57-38.</p>
        }
        {(this.props.selectedYear === 1944) &&
          <p></p>
        }
        {(this.props.selectedYear === 1946) &&
          <p>The end of World War II and the Roosevelt administration led to a landslide set of victories for Republicans in the 1946 Congressional elections.  Republicans took control of the House for the first time since the 1930 election, <span onClick={this.toggleFlippedPartyOff}>picking up 55 seats</span> and taking a 246-188 advantage over Democrats.  <span onClick={this.props.onDistrictSelected} id='025078087014'>Joseph Martin</span> (R-MA) took up the gavel of the Speaker of the House, succeeding <span onClick={this.props.onDistrictSelected} id='048074082004'>Sam Rayburn</span> (D-TX).  In the Senate, Republicans picked up 11 seats to take control of the upper chamber and a 50-46 advantage.</p>
        }
        {(this.props.selectedYear === 1948) &&
          <p></p>
        }
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
        {(this.props.selectedYear === 1962) &&
          <p>This election followed just weeks after the Cuban Missile Crisis swung sentiment towards the Democratic Party in the runup to election day. <span onClick={this.toggleFlippedPartyOff}>Democrats lost seats in the House of Representatives</span> but maintained control of the chamber, dropping from a 262-175 majority to a 258-176 majority after the seating of the new Congress.  <span onClick={this.props.onDistrictSelected} id='025088090009'>John McCormack</span> (D-MA) retained the Speaker’s position.  Democrats gained seats in the Senate, increasing their majority from 64-36 to 68-32, as Mansfield (D-MT) held onto the Majority Leader position.  The House of Representatives dropped from 437 to 435 seats as a result of planned reapportionment after the addition of HI and AK led to a temporary increase in number.</p>
        }
        {(this.props.selectedYear === 1964) &&
          <p>The 1964 election was a landslide for Democrats in the House and the Senate, as well as for the President.  After the assassination of John F. Kennedy, public sentiment favored the Democratic Party. Candidates campaigned heavily in the summer of 1964 on the proposals and legislation of the Great Society.  In the House, voters elected <span onClick={this.selectPartyFlippedOff} id='democrat'>295 Democrats</span>, up from 258 in 1962, for a majority of 295 to 140.  <span onClick={this.props.onDistrictSelected} id='025088090009'>John McCormack</span> (D-MA) retained the Speaker’s gavel, while <span onClick={this.props.onDistrictSelected} id='026089092005'>Gerald Ford</span> (R-MI) became the Minority Leader.  In the Senate, Democrats picked up picked up two seats to return to a 68-32 majority, and Mike Mansfield (D-MT) remained Senate Majority Leader.</p>
        }
        {(this.props.selectedYear === 1966) &&
          <p>The 1966 election reversed the Democratic gains of the 1964 election in the House of Representatives.  Opposition to the Vietnam War, reaction to race riots and rejection of civil rights legislation led to <span onClick={this.toggleFlippedPartyOff}>Republicans winning 47 more seats</span> than in 1964 and narrowing the Democratic majority to 248 to 187.  <span onClick={this.props.onDistrictSelected} id='025088090009'>John McCormack</span> (D-MA) held onto the Speaker’s gavel.  In the Senate, Republicans picked up 3 seats to shave the Democratic majority to 64 to 36.  Mike Mansfield (D-MT) remained Majority Leader.</p>
        }
        {(this.props.selectedYear === 1968) &&
          <p>Divisions in the Democratic Party and a more marked sorting of racial conservatives into the Republican Party contributed to losses in each chamber in the 1968 election, where Republicans picked up 5 seats from Democrats.  This represented a small shift in the House of Representatives, where Democrats held onto a significant 243 to 192 majority, but a large shift in the Senate, where Republicans ate into the Democrats’ majority, now at 58 to 42.  <span onClick={this.props.onDistrictSelected} id='025091092009'>John McCormack</span> (D-MA) retained the Speakership in the House and Mike Mansfield (D-MT) held the Majority Leader position in the Senate.</p>
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
