import * as React from 'react';
import PropTypes from 'prop-types';
import DistrictStore from '../stores/Districts';

const Text = (props) => {
  const content = {
    intro: (
      <div className='content'>
        <h2>Introduction</h2>
        <p>In the text of the U.S. Constitution, the United States Congress precedes both the executive and judicial branches; its powers and procedures are enumerated in Article I.  Many framers of the constitutional sought to limit the power of the executive with a strong legislature.  However, since the New Deal in the 1930s, the growth of the executive branch,the development of a national media market, and the growing visibility of the presidency have made the office of the president and individual presidents loom far larger than Congress as a body and than any individual legislator.  </p>
        <p>The idea of a weak Congress and a strong President confuses our understanding of the legislative process and the operations of the federal government.  For scholars and commentators alike, the sheer number of members of Congress and the often arcane procedures of Congressional politicking have led to an even greater emphasis on the presidency. These tendencies create even greater blind spots when it comes to understanding the House and the Senate.</p>
        <p>This project aims to recapture the role of Congress as an equal branch in governing, worthy of studying side-by-side with the Presidency, by offering comprehensive and fine-grained data on the history of Congressional elections.  To understand the most momentous periods of reform in American political history, we must give attention to all branches of government. Indeed, landslide presidential wins have often failed to produce a raft of policy victories -- as in 2009-10.  Public approval and the president’s political capital can very often peter out -- as in 1967-68 or 1987-88, and we understand why by considering Congress at the same time.  Only when Congressional majorities match the Presidency do we see sweeping legislative reforms -- as in the New Deal 1933-34 and the Great Society agenda in 1965-66.  Even then, there is no guarantee of dramatic political change, as in 1921-22.  The internal dynamics of Congress, such as the committee systems, the legislative rules of each chamber, and the ideologies and personalities of individual lawmakers, also factor into political and legislative change.  </p>
        <p>The Congress, and especially the House of Representatives, has often been portrayed as the more representative branch of government.  It more directly and frequently reflects the changing demographics and changing will of American voters through its biennial elections.  The fine-grained geography of Congressional districts, especially in the House, also allows us to see the waxing and waning  of democratic ideals within the long arc of expanding voting rights over time by emphasizing the building block of representative democracy -- elections.  </p>
        <p>With these visualizations and the data resources we provide, users can track their own district’s history, can explore regional and national patterns, or can download the raw data, including roll call votes, for their own research.  See the transformation of party systems and their ideologies, track the career of individual legislators, and watch the expansion of Congress with the American nation.  </p>
        <h2>A Note on Congressional Elections</h2>
        <p>All members of the House of Representatives -- now 435 voting members -- are elected every two years.  The 100 members of the Senate are divided into three classes, and each class is elected on six-year cycles.  Thus, every two years one-third of the Senate faces election.  The House has always been popularly elected.  Only since 1914, with the ratification of the 17th Amendment, has the Senate been popularly elected.  Before that, Senators were largely chosen by state legislatures.  </p>
        <h2>A Note on Congressional Reapportionment, Redistricting, and Gerrymandering</h2>
        <p>Redistricting and gerrymandering are as old as Congress itself. </p>
        <p>Since the ratification of the U.S. Constitution, Congress has set the number of federal legislators and the number of representatives per state by legislative act.  Each state determines whether its members of Congress are elected at-large or by geographic district.  Currently, all Congressional representatives represent individual geographic districts, but this was not always the case.</p>
        <p>Apportionment is the process of allocating House seats to match the changing U.S. population.  Redistricting is the state-by-state process of deciding how to divide up the population for geographic districts.  Gerrymandering is the term for a heavily partisan division of districts to favor one party or another.</p>
        <p>Article I, Section 2 of the U.S. Constitution set an initial number of 65 Representatives in 1787 and mandated a reapportionment every ten years by legislative act.  In Federalist 58, James Madison wrote that reapportionment served the interests of representative government, but that augmentation, the increase of the number of Representatives, balanced the interest of large states, which could avoid losing Representatives. Until the Fourteenth Amendment, enslaved people were counted as three-fifths of a person for purposes of representation.  </p>
        <p>The House of Representatives grew along with the United States population until reaching 433 members from 46 states at the beginning of the twentieth century.  The Reapportionment Act of 1911 set the current number of Representatives, 435, upon the recognition of Arizona and New Mexico as states.  The number of seats briefly rose to 437 in the early 1960s when Hawai’i and Alaska entered the union.  Upon reapportionment after tabulation of the 1960 Census, the number returned to 435 where it has remained since.  The District of Columbia and several territories also have non-voting Representatives.</p>
        <p>The Reapportionment Act of 1929 permanently linked the census and reapportionment and made the process automatic.  Prior to that, Congress passed reapportionment acts after each Census through 1911.  However, it failed to pass a reapportionment act until the end of the 1920s and the legislation would not take effect until after the 1930 Census. Each state still determines for itself the nature of representation, whether it be at-large, geographic districts, or some combination. </p>
        <p>Citing</p>
        <p>If you need to cite this project we suggest the following:</p>
        <div style={{marginLeft: 20}}>Robert K. Nelson, LaDale Winling, and Justin Madron, "Electing the House of Representatives," in <cite>American Panorama</cite>, ed. Nelson and Edward L. Ayers, //dsl.richmond.edu/panorama/congress.</div>
      </div>
    ),
    sources: (
      <div className='content'>
        <h2>Sources</h2>
        <p>This project drew on several sources because there was no authoritative, comprehensive dataset for Congressional election results.</p>
        <p>The two most significant sources of election data were the reports of <a href='http://history.house.gov/Institution/Election-Statistics/Election-Statistics/' target='_blank'>Election Statistics from the Clerk of the U.S. House of Representatives</a>, available from the 1920 to 2016, and <a href='https://www.icpsr.umich.edu/icpsrweb/ICPSR/studies/2' target='_blank'>Data Set 0002, "Candidate Name and Constituency Totals, 1788-1990,"</a> from the Inter-University Consortium for Political and Social Research (ICPSR).  In addition, Kenneth C. Martis’ book, <cite>The Historical Atlas of Political Parties in the United States Congress, 1789-1989</cite>, was an essential resource for candidate names and party affiliation, as was the <cite>Biographical Directory of the U.S. Congress, 1774 – Present</cite>.  For the earliest election years, we also rely on A New Nation Votes, a research project from the American Antiquarian Society.</p>
        <p>In cases where data was in conflict, we treated the Election Statistics reports and <cite>Biographical Directory</cite> as authoritative, followed by Martis and then the ICPSR dataset.  In a number of instances, a candidate’s victory was contested and later overturned for legal reasons, sometimes months later.  In those cases, we represented the winner as it was thought to be on election night, and as our data reflected.</p>
        <p>The key sources of geographic information were Jeffrey Lewis’ <a href='http://cdmaps.polisci.ucla.edu/' target='_blank'>House district boundaries dataset</a>.</p>
        <p>This atlas features general elections&#8212;special elections will be released in a subsequent revision.</p>
        <p>All of the data for this project is archived and downloadable from <a href='https://doi.org/10.7294/W45Q4T11' target='_blank'>Virginia Tech</a>.</p>
        <h2>Methods</h2>
        <p>Three choices that we have made about how to represent voting for the House across time and space warrant some explanation.</p>
        <p>First, we have tried to represent the strength of different parties over time when any district is selected. As the majority of congressional districts are redrawn every ten years following the census, we have had to algorithmically link different spaces over time. For instance, the following districts in western North Carolina are linked together:</p>
        { [1840, 1846, 1852, 1866, 1872, 1884, 1892, 1896, 1900, 1902, 1942, 1962, 1968, 1972, 1982, 1992, 1998, 2002, 2012].map(y => <object type='image/svg+xml' data={`./static/spatialIdsExamples/${y}.svg`} />) }
        <p>To link different districts across subsequent elections cycles we calculate and select the greatest areas of overlap&#8212;or the intersections&#8212;among all of them by multiplying two percentages together: the percent that that intersection overlaps with the earlier district and the percent that it intersects with the latter district. General ticket elections are skipped, as are the Civil War and Reconstruction years where southern states had seceded or were awaiting full readmitance to the Union. For the most part this algorithm works quite well, though in some cases it does result is some "drift" over long spans of time where the earliest district may not overlap closely or at all with a matched district decades later.</p>
        <p>Second, on the cartograms we have considered a district to fall within a city if its pole of inaccessibility&#8212;the interior point most distant from the boundaries of the polygon&#8212;falls within the boundaries of the census's metropolitan statistical areas. If a metropolitan statistical area has three or more congressional representatives we represent it on the cartogram. The metropolitan statistical area of 1940 is used for all earlier elections. The poles of inaccessibility are calculated using the Mapbox <a href='https://github.com/mapbox/polylabel' target='_blank'>polylabel algorithm</a>.</p>
        <p>Third, we have generated the cartogram using the D3 force algorithms, specifically <a href='https://github.com/d3/d3-force#forceCollide' target='_blank'>forceCollide</a>.</p>
      </div>
    ),
    citing: (
      <div className='content'>
        TO DO
      </div>
    ),
    about: (
      <div className='content'>
        <h2>About</h2>
        <p>"Electing the House of Representatives" was created through the collaboration of Digital Scholarship Lab at the University of Richmond and the Department of History at Virginia Tech.</p>
        <p>DSL interns Ava Clarke, Katrina Hayes-Macaluso, Chloe McKinney, and Anna Moorhead carefully checked&#8212;and continue to check and improve&#8212;the data for the project.</p>
        <p>At the Digital Scholarship Lab, Robert K. Nelson designed and developed the project. Justin Madron managed the organization and manipulation of the spatial and election data for the project.</p>
        <p>At Virginia Tech, LaDale Winling led a team of students in research and data processing.  Matthew Vaughan helped plan the organization of the project, researched, and cleaned much data, while Nick Bolin prepared material for its final publication. Research assistants Carmen Bolt, Sarah Rouzer, and Rebecca Williams contributed large amounts of data work.</p>
        <p>Additionally, research assistants Jennalee Beazley, Caitlin Brown, Alexandra Dowrey, Victoria Fowler, Rachel Snyder, Celia Tucker-Davies, Cameron Sorg, L.T. Wilkerson, students in two history classes, and participants in the Digital History Hackathon cleaned, reformatted, and checked data to the project. Special thanks for data contributions goes to Danna Agmon, Jan Winling, and Sophie Zunz.</p>
        <p>The College of Liberal Arts and Human Sciences, the Department of History at Virginia Tech, and the Virginia Center for Civil War Studies helped fund this project with grants for research and data work.</p>

      </div>
    )

  };

  return (
    <div
      className='longishform'
      style={props.dimensions.textAreaStyle}
    >
      <button
        className='close'
        onClick={props.onModalClick}
        style={{
          top: props.dimensions.textCloseTop,
          right: props.dimensions.textCloseRight
        }}
      >
        <svg
          width={props.dimensions.nextPreviousButtonHeight + 2}
          height={props.dimensions.nextPreviousButtonHeight + 2}
        >
          <g transform={`translate(${props.dimensions.nextPreviousButtonHeight / 2 + 1} ${props.dimensions.nextPreviousButtonHeight / 2 + 1}) rotate(135)`}>
            <circle
              cx={0}
              cy={0}
              r={props.dimensions.nextPreviousButtonHeight / 2}
              fill='silver'
              stroke='#38444a'
              strokeWidth={1}
            />
            <line
              x1={0}
              x2={0}
              y1={props.dimensions.nextPreviousButtonHeight / 4}
              y2={props.dimensions.nextPreviousButtonHeight / -4}
              stroke='#233036'
              strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
            />
            <line
              x1={props.dimensions.nextPreviousButtonHeight / -4}
              x2={props.dimensions.nextPreviousButtonHeight / 4}
              y1={0}
              y2={0}
              stroke='#233036'
              strokeWidth={props.dimensions.nextPreviousButtonHeight / 10}
            />
          </g>
        </svg>
      </button>
      { content[props.subject] }
    </div>
  );
};

export default Text;

Text.propTypes = {
  subject: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired,
  onModalClick: PropTypes.func.isRequired
};
