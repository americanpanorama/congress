import * as React from 'react';
import PropTypes from 'prop-types';
import DistrictStore from '../stores/Districts';

const Text = (props) => {
  const content = {
    intro: (
      <div className='content'>
        <h2>Introduction</h2>
        <p>Congress is an autonomous and co-equal branch of government, whose powers and procedures are enumerated in [Article I] of the U.S. Constitution, prior to either the Executive or Judicial branches.  However, Congress has lost that public recognition as a co-equal branch over the course of the twentieth century.  The growth of the executive branch since the New Deal, the assertive legislative role of presidential administrations, and the increasingly national media landscape has made the presidency and individual presidents loom far larger than Congress as a body.</p>
        <p>This has confounded our understanding of the legislative process and the operations of the federal government.  Landslide presidential wins may not lead to a raft of policy victories -- as in 2009-10.  Public approval and the president’s political capital may peter out -- as in 1967-68 or 1987-88.  Only when Congressional majorities match the Presidency do we see sweeping legislative reforms -- as in 1933-34 and 1965-66.  Even then, the internal dynamics of Congress, such as the committee systems and the legislative rules of each chamber present significant hurdles for policy change.</p>
        <p>This data project aims to recapture that role of Congress as an equal branch in governing and as one that more directly and frequently reflects the changing will of American voters through its biennial elections.  This project provides and interprets data on the building block of representative democracy -- election.</p>
        <p>All members of the House of Representatives -- now 435 voting members -- are elected every two years.  The 100 members of the Senate are divided into three classes, and each class is elected on six-year cycles.  Thus, every two years one-third of the Senate faces election.  The House has always been popularly elected.  Only since 1914, after the ratification of the 17th Amendment, has the Senate been popularly elected.  Before that, Senators were largely chosen by state legislatures</p>
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
        <p>At the Digital Scholarship Lab, Robert K. Nelson designed and developed the project. Justin Madron managed the organization and manipulation of the spatial and election data for the project.</p>
        <p>At Virginia Tech, Matthew Vaughan helped plan the organization of the project, researched, and cleaned much data, while Nick Bolin prepared material for its final publication.  Research assistants Carmen Bolt, Sarah Rouzer, and Rebecca Williams contributed large amounts of data work.</p>
        <p>Additionally, research assistants Jennalee Beazley, Caitlin Brown, Alexandra Dowrey, Victoria Fowler, Rachel Snyder, Cameron Sorg, L.T. Wilkerson, students in two history classes, and participants in the Digital History Hackathon contributed data to the project.</p>
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
