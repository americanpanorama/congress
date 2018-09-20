import * as React from 'react';
import PropTypes from 'prop-types';

const Text = (props) => {
  const content = {
    intro: (
      <React.Fragment>
        <h2>Introduction</h2>
        <p>Congress is an autonomous and co-equal branch of government, whose powers and procedures are enumerated in [Article I] of the U.S. Constitution, prior to either the Executive or Judicial branches.  However, Congress has lost that public recognition as a co-equal branch over the course of the twentieth century.  The growth of the executive branch since the New Deal, the assertive legislative role of presidential administrations, and the increasingly national media landscape has made the presidency and individual presidents loom far larger than Congress as a body.</p>
        <p>This has confounded our understanding of the legislative process and the operations of the federal government.  Landslide presidential wins may not lead to a raft of policy victories -- as in 2009-10.  Public approval and the president’s political capital may peter out -- as in 1967-68 or 1987-88.  Only when Congressional majorities match the Presidency do we see sweeping legislative reforms -- as in 1933-34 and 1965-66.  Even then, the internal dynamics of Congress, such as the committee systems and the legislative rules of each chamber present significant hurdles for policy change.</p>
        <p>This data project aims to recapture that role of Congress as an equal branch in governing and as one that more directly and frequently reflects the changing will of American voters through its biennial elections.  This project provides and interprets data on the building block of representative democracy -- election.</p>
        <p>All members of the House of Representatives -- now 435 voting members -- are elected every two years.  The 100 members of the Senate are divided into three classes, and each class is elected on six-year cycles.  Thus, every two years one-third of the Senate faces election.  The House has always been popularly elected.  Only since 1914, after the ratification of the 17th Amendment, has the Senate been popularly elected.  Before that, Senators were largely chosen by state legislatures</p>
      </React.Fragment>
    ),
    sources: (
      <React.Fragment>
        <h2>A Note on Sources and Methods</h2>
        <p>This project drew on several sources because there was no authoritative, comprehensive dataset for Congressional election results.</p>
        <p>The two most significant sources of election data were the reports of Election Statistics from the Clerk of the U.S. House of Representatives, available from the 1920 to 2016, and Data Set 0002, “Candidate Name and Constituency Totals, 1788-1990,” from the Inter-University Consortium for Political and Social Research (ICPSR).  In addition, Kenneth C. Martis’ book, The Historical Atlas of Political Parties in the United States Congress, 1789-1989 was an essential resource for candidate names and party affiliation, as was the Biographical Directory of the U.S. Congress, 1774 – Present.  For the earliest election years, we also rely on A New Nation Votes, a research project from the American Antiquarian Society.</p>
        <p>In cases where data was in conflict, we treated the Election Statistics reports and Biographical Directory as authoritative, followed by Martis and then the ICPSR dataset.  In a number of instances, a candidate’s victory was contested and later overturned for legal reasons, sometimes months later.  In those cases, we represented the winner as it was thought to be on election night, and as our data reflected.</p>
        <p>The two key sources of geographic information were Jeffrey Lewis’ House district boundaries dataset and, for the Senate, the state boundaries dataset from the Minnesota Population Center’s National Historical Geographic Information Systems (NHGIS) repository.</p>
        <p>This atlas features general elections -- special elections will be released in a subsequent revision.</p>
        <p>All of the data for this project is available for download on the site, and is archived at Virginia Tech at https://doi.org/10.7294/W45Q4T11.</p>
      </React.Fragment>
    ),
    citing: (
      <div>TO DO</div>
    ),
    about: (
      <React.Fragment>
        <h2>About</h2>
        <p>"Electing the House of Representatives" was created through the collaboration of Digital Scholarship Lab at the University of Richmond and the Department of History at Virginia Tech.</p>
        <p>At the Digital Scholarship Lab, Robert K. Nelson designed and developed the project. Justin Madron managed the management and manipulation of the spatial and election data for the project.</p>
        <p>At Virginia Tech, Matthew Vaughan helped plan the organization of the project, researched, and cleaned much data, while Nick Bolin prepared material for its final publication.  Research assistants Carmen Bolt, Sarah Rouzer, and Rebecca Williams contributed large amounts of data work.</p>
        <p>Additionally, research assistants Jennalee Beazley, Caitlin Brown, Alexandra Dowrey, Victoria Fowler, Rachel Snyder, Cameron Sorg, L.T. Wilkerson, students in two history classes, and participants in the Digital History Hackathon contributed data to the project.</p>
        <p>The College of Liberal Arts and Human Sciences, the Department of History at Virginia Tech, and the Virginia Center for Civil War Studies helped fund this project with grants for research and data work.</p>
      </React.Fragment>
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
