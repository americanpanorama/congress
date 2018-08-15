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
        <p>The two most significant sources of election data were the reports of Election Statistics from the Clerk of the U.S. House of Representatives, available from the 1920 to 2010 [LINK], and Data Set 0002, “Candidate Name and Constituency Totals, 1788-1990,” from the Inter-University Consortium for Political and Social Research (ICPSR [LINK]).  In addition, Kenneth C. Martis’ book, The Historical Atlas of Political Parties in the United States Congress, 1789-1989 was an essential resource for candidate names and party affiliation, as was the Biographical Directory of the U.S. Congress, 1774 – Present [LINK].  For the earliest election years, we also rely on A New Nation Votes [LINK], a research project from the American Antiquarian Society.</p>
        <p>In cases where data was in conflict, we treated the Election Statistics reports and Biographical Directory as authoritative, followed by Martis and then the ICPSR dataset.  In a number of instances, a candidate’s victory was contested and later overturned for legal reasons, sometimes months later.  In those cases, we represented the winner as it was thought to be on election night, and as our data reflected.</p>
        <p>The two key sources of geographic information were Jeffrey Lewis’ House district boundaries dataset [LINK] and, for the Senate, the state boundaries dataset from the Minnesota Population Center’s National Historical Geographic Information Systems (NHGIS) repository [LINK].</p>
        <p>All of the data for this project is available for download on the site, and is archived at Virginia Tech at https://doi.org/10.7294/W45Q4T11.</p>
      </React.Fragment>
    ),
    citing: (
      <div>TO DO</div>
    ),
    about: (
      <div>TO DO</div>
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
        <span>close</span>
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
