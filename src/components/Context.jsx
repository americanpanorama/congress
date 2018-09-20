import * as React from 'react';
import PropTypes from 'prop-types';

const Context = (props) => {
  const toggleFlippedPartyOff = () => {
    props.onPartySelected(null);
    props.toggleFlipped();
  };

  const selectPartyFlippedOff = (id) => {
    props.onPartySelected(id);
    props.toggleFlipped(false);
  };

  const { dimensions } = props;

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
      {(props.selectedYear === 1912) &&
        <p><span onClick={toggleFlippedPartyOff}>Democrats took the House in a 291-134 landslide</span> as a Progressive faction split from the Republican Party in the 1912 elections.  <span onClick={selectPartyFlippedOff} id='third'>Progressives took 9 seats and an independent 1</span> in the House of Representatives.  In the Senate, Democrats picked up 4 seats in the Midwest and West to take a 47-45 advantage of the chamber.</p>
      }
      {(props.selectedYear === 1914) &&
        <p><span onClick={toggleFlippedPartyOff}>Democrats lost 61 seats in the House of Representatives</span> but maintained control of the chamber, 230-196.  The Midwest was up for grabs, as Republicans pickups were concentrated in Illiois, Ohio, along with a handful in New york.  <span onClick={selectPartyFlippedOff} id='third'>Progressives won 6 seats, Socialists 1, and Prohibitionists 1</span>.  Facing popular election for the first time, Democrats picked up 3 seats in the Senate to increase their advantage to 53-41.  </p>
      }
      {(props.selectedYear === 1916) &&
        <p>Staying out of the Great War was one of the key political issues of the 1916 campaign, and <span onClick={toggleFlippedPartyOff}>Republicans picked up 19 seats</span> to take a 216-214 advantage in the House.  However, Democrats formed a coalition government with <span onClick={selectPartyFlippedOff} id='third'>the 3 Progressives, 1 Socialist, and 1 Prohibitionist also winning seats</span>, to maintain control under Speaker Champ Clark.  In the Senate, Democrats lost a seat but maintained control, with a 55-41 advantage.  Jeannette Rankin (R-MT) was the first woman elected to the Senate.</p>
      }
          {(props.selectedYear === 1918) &&
        <p>American involvement in the Great War was the key issue of the 1918 elections, in which Republicans overcame the coalition government, <span onClick={toggleFlippedPartyOff}>won 24 seats</span>, and took control of the House 240-192 as Frederick Gillette became the Speaker, succeeding Champ Clark.  The Farmer-Labor Party won its first seat, and the Prohibition party held its 1 seat.  In the Senate, all Senators up for election in 1918 were popularly elected.  Republicans picked up 4 seats to create an evenly divided Senate, 48-48, but Democrats, with the Vice Presidency, held sway until special elections when Republicans controlled the chamber.</p>
      }
      {(props.selectedYear === 1920) &&
        <p>Republicans won a landslide set of elections in 1920, the first federal election in which women could vote after ratification of the 19th Amendment.  In the House, <span onClick={toggleFlippedPartyOff}>the GOP picked up 63 seats</span> to run their advantage up to <span onClick={selectPartyFlippedOff} id='republican'>303</span> to <span onClick={selectPartyFlippedOff} id='democrat'>131</span>, with 1 seat held by a Socialist, Meyer London in New York.  In the Senate, the Republicans picked up 10 seats to hold control by a  59-37 margin over Democrats.</p>
      }
      {(props.selectedYear === 1922) &&
        <p>Democrats rolled back the gains Republicans made in the 1920 House election, picking up 76 seats to cut the GOP advantage to <span onClick={selectPartyFlippedOff} id='republican'>225</span>-<span onClick={selectPartyFlippedOff} id='democrat'>207</span>.  The Farmer-Labor Party won 2 seats and the Socialist Party won 1.  In the Senate, Democrats picked up 6 seats to trim Republican control to a 53-42 lead, while the Farmer-Labor party won 1 seat with the victory of Henrik Shipstead in Minnesota.</p>
      }
      {(props.selectedYear === 1924) &&
        <p>Economic growth aided Republican electoral fortunes up and down the ticket, as the GOP held control of the House and Senate in 1924.  In the House, Republicans gained 22 seats to increase their margin over Democrats, <span onClick={selectPartyFlippedOff} id='republican'>247</span>-<span onClick={selectPartyFlippedOff} id='democrat'>183</span>, with Farmer-Labor winning three seats and the Socialist Party one seat.  Nicholas Longworth (R-OH) succeeded the retiring Frederick Gillett (R-MA) as Speaker of the House when the new Congress was seated.  In the Senate, Republicans gained 3 seats to take a 54-41 advantage over Democrats, while the Farmer-Labor party lost a seat to drop to 1.</p>
      }
      {(props.selectedYear === 1926) &&
        <p>No national issue dominated the elections of 1926, and the overall robust economy and lack of international conflicts owing to postwar isolationism meant mixed results in the Congressional elections.  Republicans retained control of the House of Representatives by a <span onClick={selectPartyFlippedOff} id='republican'>238</span>-<span onClick={selectPartyFlippedOff} id='democrat'>194</span> margin as <span onClick={toggleFlippedPartyOff}>Democrats picked up 11 seats</span>. The Farmer-Labor party dropped from 3 seats to 2 and Wisconsin Socialist won re-election.  In the Senate, Republicans lost 6 seats but held control of the chamber, 50-45.</p>
      }
      {(props.selectedYear === 1928) &&
        <p>The booming economy of the 1920s and internal divisions in the Democratic Party led to significant Republican gains in the House and Senate.  The <span onClick={toggleFlippedPartyOff}>GOP picked up 32 seats</span> in the House, increasing their advantage over Democrats to <span onClick={selectPartyFlippedOff} id='republican'>270</span>-<span onClick={selectPartyFlippedOff} id='democrat'>164</span>, with two Farmer-Labor seats and one Socialist seat.  In the Senate, Republicans gained 6 seats for a 53-39 advantage over Democrats, while the Farmer-Labor party held one seat.</p>
      }
      {(props.selectedYear === 1930) &&
        <p>Voters turned Republicans out of office across the country as the electorate rejected conservative approaches to the Great Depression.  <span onClick={toggleFlippedPartyOff}>Democrats picked up 52 seats</span> in the election, barely missing taking control of the House, 216-218.  However, several special elections after the death of elected members led to Democratic control of the House, 218-217.  <span onClick={props.onDistrictSelected} id='048066072015'>John Nance Garner</span> (D-TX) succeeded <span onClick={props.onDistrictSelected} id='039064072001'>Nicholas Longworth</span> (R-OH) as Speaker of the House.  In the Senate, Democrats picked up 6 seats but Republicans retained control of the chamber, 50-45.</p>
      }
      {(props.selectedYear === 1932) &&
        <p>The electoral wave rejecting the Republican party continued in 1932, when <span onClick={toggleFlippedPartyOff}>Democrats picked up 97 seats</span> in the House to take a 313-117 advantage, with the Farmer-Labor party gaining 4 more seats for a total of 5.  <span onClick={props.onDistrictSelected} id='017063077020'>Henry Rainey</span> (D-IL) replaced <span onClick={props.onDistrictSelected} id='048073073015'>John Garner</span> (D-TX) as Speaker when Garner became Vice President.  In the Senate, Democrats gained 12 seats to take control, 59-36.</p>
      }
      {(props.selectedYear === 1934) &&
        <p>Voters largely approved of the wave of New Deal legislation and programs to address the Great Depression returning control to Democrats in the House and <span onClick={toggleFlippedPartyOff}>adding 9 more seats</span> than in 1932, for an advantage over Republicans of 322-103. <span onClick={props.onDistrictSelected} id='047074077005'>Joseph Byrns</span> (D-TN) succeeded Henry Rainey (D-IL) as Speaker of the House, until Byrns died in 1936, when <span onClick={props.onDistrictSelected} id='001073087007'>William Bankhead</span> (D-AL) assumed the Speakership.  The Progressive Party won 7 seats, and the Farm-Laborer Party dropped to 3 seats in the House.  In the Senate, Democrats picked up 9 seats to take a 69-25 advantage in the chamber.  The Progressive and Farmer-Labor parties each won 1 Senate seat.</p>
      }
      {(props.selectedYear === 1936) &&
        <p>Democrats strengthened their hold on the House of Representatives in 1936 campaigning on consolidation and protection of the New Deal.  Democrats <span onClick={toggleFlippedPartyOff}>picked up 12 seats</span> to take a 334-88 advantage in the House.  In the Senate, Democrats gained 5 seats and increased their advantage over Republicans, 74-17, while Farmer-Labor remained at 2 seats, the Progressive Party at 1 seat, and 1 Independent won a seat.</p>
      }
      {(props.selectedYear === 1938) &&
        <p>The 1938 elections saw a resurgence of the Republican Party, as the GOP <span onClick={toggleFlippedPartyOff}>picked up 81 seats</span> in the House of Representatives to cut the Democratic advantage to 262-169.  The Progressive and Farmer-Labor parties lost seats, dropping to 2 and 1, respectively, while the American Labor party won a single seat.  In the Senate, Republicans picked up 7 seats to cut the Democratic control to a 68-23 advantage, with the Farmer-Labor party holding 2 seats, Progressives 1, and 1 Independent.</p>
      }
      {(props.selectedYear === 1940) &&
        <p>Democrats held their support in the fall of 1940 as economic growth returned after the recession of 1937. The continuing isolationism of the nation, despite the growing war in Europe, meant that mobilization was not a decisive issue for this election.  <span onClick={toggleFlippedPartyOff}>Democrats picked up 5 seats</span> in the House to increase their advantage to 267-162.  <span onClick={selectPartyFlippedOff} id='third'>Minor parties held six seats</span>, including 3 for the Progressive party, 1 for American Labor, 1 for Farmer-Labor, and one Independent.  In the Senate, Republicans picked up 3 seats, but Democrats retained control of the chamber, 66-27.  The Progressive and Farmer-Labor parties each won one seat.</p>
      }
      {(props.selectedYear === 1942) &&
        <p>Republicans made significant gains in the 1942 elections as the reform and economic recovery of the New Deal wound down, replaced by appropriations and mobilization for World War II.  <span onClick={toggleFlippedPartyOff}>Republicans picked up 47 seats in the House</span> to cut Democratic control to a narrow 222-209 advantage.  In the Senate, Republicans picked up 9 seats to cut the Democratic advantage to 57-38.</p>
      }
      {(props.selectedYear === 1944) &&
        <p></p>
      }
      {(props.selectedYear === 1946) &&
        <p>The end of World War II and the Roosevelt administration led to a landslide set of victories for Republicans in the 1946 Congressional elections.  Republicans took control of the House for the first time since the 1930 election, <span onClick={toggleFlippedPartyOff}>picking up 55 seats</span> and taking a 246-188 advantage over Democrats.  <span onClick={props.onDistrictSelected} id='025078087014'>Joseph Martin</span> (R-MA) took up the gavel of the Speaker of the House, succeeding <span onClick={props.onDistrictSelected} id='048074082004'>Sam Rayburn</span> (D-TX).  In the Senate, Republicans picked up 11 seats to take control of the upper chamber and a 50-46 advantage.</p>
      }
      {(props.selectedYear === 1948) &&
        <p></p>
      }
      {(props.selectedYear === 1950) &&
        <p>In the 1950 elections, both chambers of Congress shifted in favor of the Republicans. Democrats maintained a narrow majority of 48 seats in the Senate, while Republicans controlled 47 and there was a single independent. Meanwhile, the Democrats <span onClick={toggleFlippedPartyOff}>lost nearly thirty seats</span> in the House, but maintained <span onClick={selectPartyFlippedOff} id='democrat'>a majority of 234</span>. <span onClick={selectPartyFlippedOff} id='republican'>Republicans held 199</span>, while <span onClick={selectPartyFlippedOff} id='third'>Independents held 2</span>.  Future President Richard Nixon (R-CA) won the election for Senator of California, rising from the House of Representatives. Increasing anxieties about the Cold War contributed to a Red Scare where government officials accused and harassed leftist organizations and individuals under the banner of anti-communism.</p>
      }
      {(props.selectedYear === 1952) &&
        <p>Republicans took control of both houses of Congress in the 1952 elections, along with the presidency.  Republicans took a narrow 48-46 majority in the Senate, with two independents. The GOP held a similarly narrow margin in the House with <span onClick={selectPartyFlippedOff} id='republican'>221 seats</span> to <span onClick={selectPartyFlippedOff} id='democrat'>213 Democrats</span> and <span onClick={selectPartyFlippedOff} id='third'>a single independent</span>. The election revolved around the continuing war in Korea, as well as debates over the Taft-Hartley Act, which limited the reach of unions.</p>
      }
      {(props.selectedYear === 1954) &&
        <p>Democrats regained control of both chambers of Congress in these midterm elections.  In the Senate, they reclaimed a narrow majority of 48-47, along with a single independent. Democrats would hold this majority in the Senate until the election of 1980.  In the House, <span onClick={selectPartyFlippedOff} id='democrat'>Democrats regained their majority, 232-203</span>, and would hold it until the election of 1994. The 1954 elections centered in large part around the House Un-American Activities Committee (HUAC) and the excesses of Senator Joseph McCarthy's continuing accusations of Communists in the federal government. Within a week of the election, the Senate began debate of McCarthy’s censure and censured him less than a month after the November elections. <span onClick={props.onDistrictSelected} id='048083085004'>Sam Rayburn</span> (D-TX) resumed the position of Speaker of the House, which he had held twice before.</p>
      }
      {(props.selectedYear === 1956) &&
        <p>Democrats gained seats in both chambers of Congress, while Eisenhower won re-election to the Presidency in 1956.  Democrats narrowly increased their majority in the Senate by a seat to 49-47.  In the House, Democrats <span onClick={toggleFlippedPartyOff}>increased their majority from 29 seats to 33 seats</span>, 234-201. This was the last election prior to Alaska and Hawaii's admission to the union. The election centered around the flagging economy and the continued presence of American troops in Korea following the armistice.</p>
      }
      {(props.selectedYear === 1958) &&
        <p>Democrats again increased their majorities in both chambers of Congress in the landslide election of 1958.  In the Senate, the Democrats’ 2-seat majority grew to a 64-34 advantage. In the House, <span onClick={toggleFlippedPartyOff}>Democrats gained nearly 50 seats</span>, bringing <span onClick={selectPartyFlippedOff} id='democrat'>their total to 283</span> against <span onClick={selectPartyFlippedOff} id='republican'>153 Republicans</span>, while receiving more than 5 million more votes than Republicans nationwide. Concern over the launch of Sputnik, the Soviet Union’s space satellite, along with recession of 1958, the first major economic downturn since the end of World War II, contributed to the Democratic victory.</p>
      }
      {(props.selectedYear === 1960) &&
        <p>1960 was the first election in which citizens voted in all fifty of the current states. Congress had officially declared Alaska a state on January 3, 1959 and Hawaii a state on August 21, 1959. Because of this, the 87th Congress was the only Congress to have 437 representatives, until reapportionment after the 1960 census. The Senate leaned heavily Democratic, as Dems controlled the Senate 64-36, and controlled the House of Representatives 262-175. <span onClick={props.onDistrictSelected} id='048086087004'>Sam Rayburn</span> (D-TX) retained the speakership until his death in November 1961, when he was succeeded by <span onClick={props.onDistrictSelected} id='025078087012'>John McCormack</span> (D-MA).</p>
      }
      {(props.selectedYear === 1962) &&
        <p>This election followed just weeks after the Cuban Missile Crisis swung sentiment towards the Democratic Party in the runup to election day. <span onClick={toggleFlippedPartyOff}>Democrats lost seats in the House of Representatives</span> but maintained control of the chamber, dropping from a 262-175 majority to a 258-176 majority after the seating of the new Congress.  <span onClick={props.onDistrictSelected} id='025088090009'>John McCormack</span> (D-MA) retained the Speaker’s position.  Democrats gained seats in the Senate, increasing their majority from 64-36 to 68-32, as Mansfield (D-MT) held onto the Majority Leader position.  The House of Representatives dropped from 437 to 435 seats as a result of planned reapportionment after the addition of HI and AK led to a temporary increase in number.</p>
      }
      {(props.selectedYear === 1964) &&
        <p>The 1964 election was a landslide for Democrats in the House and the Senate, as well as for the President.  After the assassination of John F. Kennedy, public sentiment favored the Democratic Party. Candidates campaigned heavily in the summer of 1964 on the proposals and legislation of the Great Society.  In the House, voters elected <span onClick={selectPartyFlippedOff} id='democrat'>295 Democrats</span>, up from 258 in 1962, for a majority of 295 to 140.  <span onClick={props.onDistrictSelected} id='025088090009'>John McCormack</span> (D-MA) retained the Speaker’s gavel, while <span onClick={props.onDistrictSelected} id='026089092005'>Gerald Ford</span> (R-MI) became the Minority Leader.  In the Senate, Democrats picked up picked up two seats to return to a 68-32 majority, and Mike Mansfield (D-MT) remained Senate Majority Leader.</p>
      }
      {(props.selectedYear === 1966) &&
        <p>The 1966 election reversed the Democratic gains of the 1964 election in the House of Representatives.  Opposition to the Vietnam War, reaction to race riots and rejection of civil rights legislation led to <span onClick={toggleFlippedPartyOff}>Republicans winning 47 more seats</span> than in 1964 and narrowing the Democratic majority to 248 to 187.  <span onClick={props.onDistrictSelected} id='025088090009'>John McCormack</span> (D-MA) held onto the Speaker’s gavel.  In the Senate, Republicans picked up 3 seats to shave the Democratic majority to 64 to 36.  Mike Mansfield (D-MT) remained Majority Leader.</p>
      }
      {(props.selectedYear === 1968) &&
        <p>Divisions in the Democratic Party and a more marked sorting of racial conservatives into the Republican Party contributed to losses in each chamber in the 1968 election, where Republicans picked up 5 seats from Democrats.  This represented a small shift in the House of Representatives, where Democrats held onto a significant 243 to 192 majority, but a large shift in the Senate, where Republicans ate into the Democrats’ majority, now at 58 to 42.  <span onClick={props.onDistrictSelected} id='025091092009'>John McCormack</span> (D-MA) retained the Speakership in the House and Mike Mansfield (D-MT) held the Majority Leader position in the Senate.</p>
      }
      {(props.selectedYear === 1970) &&
        <p>The 1970 midterm elections saw Democrats make <span onClick={toggleFlippedPartyOff}>a 12-seat pickup</span> in the House, for a 255-180 advantage.  <span onClick={props.onDistrictSelected} id='040091092003'>Carl Albert</span> (D-OK) succeeded John McCormack (D-MA) as the Speaker of the House. Republicans made a 3-seat gain in the Senate to cut the Democrats’ advantage to 53-45, with two other Senators, Conservative James Buckley of New York, and Harry Byrd, Jr., an independent from Virginia who was formerly a Democrat and caucused with Senate Democrats.  The Republican Southern Strategy of playing up racial resentment proved less effective in this election than in 1968, and analysts interpreted the mixed outcome of the elections as a sign of voter fatigue with partisan policymaking.</p>
      }
      {(props.selectedYear === 1972) &&
        <p>In 1972, Republicans made gains in the House of Representatives, <span onClick={toggleFlippedPartyOff}>picking up twelve seats</span> and cutting the Democratic advantage to 242-192. In the Senate, Democrats gained two seats to push their advantage to 56-42.  1972 was the first federal election after passage of the 26th Amendment, which lowered the voting age from 21 to 18.</p>
      }
      {(props.selectedYear === 1974) &&
        <p>The 1974 elections were landslides for the Democratic Party in the wake of the Watergate scandal and President Richard Nixon’s resignation.  In the Senate, Democrats picked up four seats to increase their advantage to 60-38, with two third-party senators remaining.  In the House, <span onClick={toggleFlippedPartyOff}>Democrats gained 49 seats</span> to increase their advantage to 291-144.</p>
      }
      {(props.selectedYear === 1976) &&
        <p>Democrats maintained their control of the Senate, but Republicans picked up one seat to put the margin at 61-38, with one independent, Harry F. Byrd, Jr., of Virginia.  In the House, <span onClick={toggleFlippedPartyOff}>Democrats picked up one seat</span>, increasing their margin to 292-143.  Speaker Carl Albert retired, succeeded by <span onClick={props.onDistrictSelected} id='025093097008'>Thomas “Tip” O’Neill</span> (D-MA).</p>
      }
      {(props.selectedYear === 1978) &&
        <p>An energy crisis and high inflation dominated politics in 1978, as Republicans rolled back some of the Democratic gains from 1974.  <span onClick={toggleFlippedPartyOff}>The GOP picked up 15 seats in the House</span> and cut their seat deficit to 277-158.  In the Senate, Republicans gained two seats to cut the Democratic advantage to 59-40, with one independent.  </p>
      }
      {(props.selectedYear === 1980) &&
        <p>Republicans made sizeable gains in the House, Senate, and won the presidency in the wave election of 1980.  In the House, <span onClick={toggleFlippedPartyOff}>the GOP picked up 34 seats</span> to cut the Democratic margin to 243-192.  In the Senate, Republicans picked up 12 seats to take control of the chamber, 53-46, with one independent.  Continuing economic weakness, as well as a hostage crisis in Iran, shaped the 1980 campaign and election.  Republicans made inroads into southern states, breaking nearly a century of a solid Democratic South, as the two parties continued their post-Civil Rights transformation.</p>
      }
      {(props.selectedYear === 1982) &&
        <p>Democrats <span onClick={toggleFlippedPartyOff}>gained 26 seats in House elections</span> to increase their advantage to 269-166.  Republicans held their control of the Senate, 54-46, as Democrats won the lone seat held by an independent.  The campaign and election were shaped by the 1982 recession, initiated by the Federal Reserve to control inflation, which dampened the enthusiasm voters expressed for Republicans in 1980.</p>
      }
      {(props.selectedYear === 1984) &&
        <p>Election results were mixed in 1984 as Democrats gained two seats in the Senate to cut the Republican advantage to 53-47, but Republicans <span onClick={toggleFlippedPartyOff}>picked up 16 seats in the House of Representatives</span> as economic recovery aided Republican electoral fortunes.  Democrats maintained control of the lower chamber with a 253-182 advantage.</p>
      }
      {(props.selectedYear === 1986) &&
        <p>Democrats gained 8 seats in the Senate to take control of the upper chamber, 55-45.  <span onClick={toggleFlippedPartyOff}>Democrats gained 5 seats in the House</span> to increase their advantage to 258-177, as <span onClick={props.onDistrictSelected} id='048099102012'>Jim Wright</span> (D-TX) succeeded Tip O’Neill as Speaker of the House. The first revelations of the Iran-Contra Affair came out during the campaign season, and Congressional candidates took issue with the administration’s foreign policy efforts.</p>
      }
      {(props.selectedYear === 1988) &&
        <p>Democrats made slight gains in both chambers of Congress in 1988.  In the House of Representatives, they <span onClick={toggleFlippedPartyOff}>picked up two seats</span> to take a 260-175 advantage.  The Democrats picked up one seat in the Senate to take a 55-45 advantage over Republicans.  Few headline issues drove the national Congressional campaign, which was seen as a referendum on the preceding years of the Republican Reagan administration.  It largely revolved around competing plans for maintaining economic growth and continuing negotiations with the Soviet Union.</p>
      }
      {(props.selectedYear === 1990) &&
        <p>The 1990 Congressional mid-term elections revolved around two major issues: growing tensions in the Persian Gulf and President George H. W. Bush's acceptance of a tax increase as part of that year's budget negotiations. Democrats retained control of both the House and Senate, gaining one Senate seat for an advantage of 56 to Republicans 44. In the House, Tom Foley (D-WA) remained Speaker of the House as Democrats <span onClick={toggleFlippedPartyOff}>picked up seven seats</span> for <span onClick={selectPartyFlippedOff} id='democrat'>a total of 267</span>, while the Republicans lost nine for <span onClick={selectPartyFlippedOff} id='republican'>167 total seats</span>. In Vermont, <span onClick={props.onDistrictSelected} id='050098102000'>Bernard Sanders</span> won the state’s at-large House seat for the first time, <span onClick={selectPartyFlippedOff} id='third'>the chamber’s lone independent</span>.</p>
      }
      {(props.selectedYear === 1994) &&
        <p>In the 1994 mid-term election, Republicans won control of both the House and the Senate for the first time since 1946. They gained almost ten seats in the Senate, claiming a slim majority of 52 to Democrats' 48. In the House, meanwhile, the <span onClick={toggleFlippedPartyOff}>Republicans gained 54 seats</span>, bringing <span onClick={selectPartyFlippedOff} id='republican'>their total in the chamber to 230</span>, while <span onClick={selectPartyFlippedOff} id='democrat'>Democrats held 204</span>.  Bernard Sanders of Vermont remained the <span onClick={selectPartyFlippedOff} id='third'>sole independent</span> in Congress. The elections saw Republicans gaining near parity in representation with Democrats in the South for the first time.</p>
      }
    </div>
  );
};

export default Context;

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
