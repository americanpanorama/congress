import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

const TextsStore = {

  data: {
    modal: {
      open: false,
      subject: null
    },
    intro: `
      <h2>Introduction</h2>
      <p>Congress is an autonomous and co-equal branch of government, whose powers and procedures are enumerated in [Article I] of the U.S. Constitution, prior to either the Executive or Judicial branches.  However, Congress has lost that public recognition as a co-equal branch over the course of the twentieth century.  The growth of the executive branch since the New Deal, the assertive legislative role of presidential administrations, and the increasingly national media landscape has made the presidency and individual presidents loom far larger than Congress as a body.</p>
      <p>This has confounded our understanding of the legislative process and the operations of the federal government.  Landslide presidential wins may not lead to a raft of policy victories -- as in 2009-10.  Public approval and the president’s political capital may peter out -- as in 1967-68 or 1987-88.  Only when Congressional majorities match the Presidency do we see sweeping legislative reforms -- as in 1933-34 and 1965-66.  Even then, the internal dynamics of Congress, such as the committee systems and the legislative rules of each chamber present significant hurdles for policy change.</p>
      <p>This data project aims to recapture that role of Congress as an equal branch in governing and as one that more directly and frequently reflects the changing will of American voters through its biennial elections.  This project provides and interprets data on the building block of representative democracy -- election.</p>
      <p>All members of the House of Representatives -- now 435 voting members -- are elected every two years.  The 100 members of the Senate are divided into three classes, and each class is elected on six-year cycles.  Thus, every two years one-third of the Senate faces election.  The House has always been popularly elected.  Only since 1914, after the ratification of the 17th Amendment, has the Senate been popularly elected.  Before that, Senators were largely chosen by state legislatures</p>
      `,
    sources: `
      <h2>A Note on Sources and Methods</h2>
      <p>This project drew on several sources because there was no authoritative, comprehensive dataset for Congressional election results.</p>
      <p>The two most significant sources of election data were the reports of Election Statistics from the Clerk of the U.S. House of Representatives, available from the 1920 to 2010 [LINK], and Data Set 0002, “Candidate Name and Constituency Totals, 1788-1990,” from the Inter-University Consortium for Political and Social Research (ICPSR [LINK]).  In addition, Kenneth C. Martis’ book, The Historical Atlas of Political Parties in the United States Congress, 1789-1989 was an essential resource for candidate names and party affiliation, as was the Biographical Directory of the U.S. Congress, 1774 – Present [LINK].  For the earliest election years, we also rely on A New Nation Votes [LINK], a research project from the American Antiquarian Society.</p>
      <p>In cases where data was in conflict, we treated the Election Statistics reports and Biographical Directory as authoritative, followed by Martis and then the ICPSR dataset.  In a number of instances, a candidate’s victory was contested and later overturned for legal reasons, sometimes months later.  In those cases, we represented the winner as it was thought to be on election night, and as our data reflected.</p>
      <p>The two key sources of geographic information were Jeffrey Lewis’ House district boundaries dataset [LINK] and, for the Senate, the state boundaries dataset from the Minnesota Population Center’s National Historical Geographic Information Systems (NHGIS) repository [LINK].</p>
      <p>All of the data for this project is available for download on the site, and is archived at Virginia Tech at https://doi.org/10.7294/W45Q4T11.</p>
    `,
    citing: `
      <h2>Linking to and Citing</h2>
      <p>The URL for <cite>Renewing Inequality</cite> updates to reflect the current map view, which city or project is selected, any text that is open, etc. You can use those URLs to link to a particular view.</p>
      <p>You can also use those links for citations. We recommend the following format using the <cite>Chicago Manual of Style</cite>. Note the URL below reflects the current view.<p>
      <p style='margin: 0 25px 25px'>Digital Scholarship Lab, &ldquo;Renewing Inequality,&rdquo; <cite>American Panorama</cite>, ed. Robert K. Nelson and Edward L. Ayers, accessed {THE_DATE}, {THE_URL}.</p>
    `,
    about: `
      <h2>About</h2>
      <p><cite>Renewing Inequality</cite> was developed by a team at the University of Richmond's Digital Scholarship Lab: Brent Cebul, Robert K. Nelson, Justin Madron, and Nathaniel Ayers. Leif Fredrickson was instrumental in the preliminary conceptualization and planning of this project. Gabriella Schneider, Leah Reistle, Emily Landon, Ashley Flanigan, Nat Berry, Patrick Kliebert, Paige Warner, Lina Tori Jan, Erica Ott, Rebecca Tribble, Lily Calaycay, Barbie Savani, Emily Larrabee, Megan Towey, Anna Ellison, Shayna Webb, Kim D’agostini, Benjamin Barad, Evan McKay, and Bonnie Butler did a massive amount of data entry and georeferenced hundreds of projects. Helen Helfland did research at the Prelinger Library to find many project footprints.</p>
      <p>The generosity of historians, archivists, and colleagues has been remarkable. We owe our thanks to Nathan Connolly, LaDale Winling, Andrew Kahrl, Lauren Tilton, and David Hochfelder for extraordinarily helpful feedback about the project. Shannon Marie Lauch, David Schuyler, Marie-Alice L'Heureux, Damon Scott, Elsa Devienne, Elizabeth J. Mueller, Rebecca S. Wingo, Renee Sharrock, and Mike Christenson all shared expertise and resources as we located and mapped urban renewal projects.  Sam Schuth and Kimberly Wolfe ILLed many dozens of reports.</p>
      <p>The <a href='//mellon.org'>Andrew W. Mellon Foundation</a> provided the DSL generous funding to work on this and the other initial maps of <cite><a href='//dsl.richmond.edu/panorama'>American Panorama</a></cite>.</p>
      <div><a rel='license' href='http://creativecommons.org/licenses/by-nc-sa/4.0/''><img alt='Creative Commons License' src='https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png' class='cc' /></a><br />This work and its data are licensed under a <a rel='license' href='http://creativecommons.org/licenses/by-nc-sa/4.0/'>Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.</div>
    `,
    defining: `
      <h2>Overview of the Legislative<br />History of Urban Renewal</h2>
      <h3>Housing Act of 1949</h3>
      <ul>
        <li>Title I: established federal financing for slum clearance</li>
        <li>Title II: expanded FHA mortgage insurance program</li>
        <li>Title III: set aside federal funds to construct 800,000 units of public housing over a six year period (this title expanded upon the goals and funding created in the Housing Acts of 1937 and 1934). By 1954, only a quarter of the units had been constructed</li>
      </ul>
      <p>The Housing Act set aside $1 billion in federal aid to assist localities with clearing and redeveloping slum areas. The Housing portion of Title I was to be carried out largely by private developers, while Title III funds for public housing could be used with or without application for Title I.  The emphasis of the 1949 Act was still very much on housing. As the legislation read, the Act established the goal of “a decent home and suitable living environment for every American family.” While the Act did not mandate that public housing be associated with a renewal project, it stipulated that renewal sites must be “predominantly residential” either before or following redevelopment.</p>

      <h3>Housing Act of 1954</h3>
      <ul>
        <li>Established the 701 Planning Grant Program that offered financial support for establishing planning agencies for cities with a population of less than 25,000. The 701 program</li>
        <li>Deemphasized public housing goals, calling for just 35,000 new units and only for those who were to be displaced by slum-clearance programs</li>
        <li>Authorized a new mortgage insurance program to subsidize rehabilitation of dwellings and the construction of new housing in urban renewal areas</li>
      </ul>
      <p>As amended, the Housing Act of 1954 deemphasized housing and inserted language and provisions designed to support urban redevelopment plans. In particular, the Act mandated that municipalities submit a “workable program” for redevelopment. This requirement for comprehensive planning prior to securing federal aid was the first of its kind.</p>
 
      <h3>1955 Amendments to Housing Act</h3>
      <p>Enabled state and local governments to finance construction of public facilities under Title I.</p>

      <h3>1959 Amendments to Housing Act</h3>
        <p>Universities were authorized to receive renewal funds without having to include plans for housing</p>

      <h3>1961 Omnibus Housing Act</h3>
      <ul>
        <li>Authorized a further $2 billion for urban renewal funds</li>
        <li>Authorized $75 million to expand the 701 planning grant program (and raised the threshold from cities of 25,000 or fewer to 50,000 or fewer)</li>
        <li>Increased the federal share of renewal grants from 2/3 to 3/4 for projects in communities of 50,000 or fewer or in economically depressed cities of up to 150,000</li>
        <li>Authorized hospitals to receive renewal funds</li>
        <li>Enabled local renewal authorities to sell land and property at sub-market rates to cooperatives, non-profits, and public agencies who plan to build moderate-income rental units</li>
      </ul>
      <h3>1964</h3>
      <ul>
        <li>A new regulation stipulates that within three years all municipalities receiving urban renewal funds had to set a minimum housing code standard (or risk losing federal renewal funds) and demonstrate that the code was being enforced</li>
        <li>Permitted renewal funds be used to enforce housing codes in renewal areas</li>
        <li>Required that no demolition project be undertaken until the HHFA determined that the same goals could not be realized through rehabilitation</li>
        <li>Authorized urban planning aid (701 program) for (1) an community experiencing employment loss thanks to the withdrawal of a federal facility; (2) any depressed area regardless of population that had qualified for assistance under the Area Redevelopment Administration (which was terminated that year); (3) Indian reservations; and (4) any county with populations over 50,000</li>
      </ul>
      <h3>1965</h3>
      <p>>The Housing Act of 1965 was a landmark in terms of delivering rent supplements for low-income families.</p>
      <p>In terms of redevelopment, the Act extended urban renewal for four years, through October 1, 1969, and provided a further $2.9 billion for grants. It also:</p>
      <ul>
        <li>Expanded urban renewal code enforcement programs</li>
        <li>Provided grants to low-income homeowners in renewal areas to rehabilitate their homes</li>
        <li>Established uniform land-acquisition procedure for property seized through eminent domain under the renewal program</li>
        <li>Authorized grants for up to two-thirds of the cost of building neighborhood facilities such as health, recreation, and community centers</li>
        <li>Authorized grants for urban beautification programs and increased renewal grants for providing parks and playgrounds</li>
        <li>Created the “General Neighborhood Renewal Plans” intended to include non-renewal areas in the comprehensive planning for community development</li>
        <li>Made ARA-designated depressed areas with populations above 150,000 eligible for urban renewal capital grants with a federal matching ratio of three-quarters</li>
      </ul>

      <h3>1966 Demonstration Cities and Metropolitan Development Act of 1966</h3>
      <ul>
        <li>Required that the residential development within urban renewal areas provide a “substantial” supply of standard housing of low and moderate cost and ensure “marked progress in serving the poor and disadvantaged people living in slum and blighted areas.”</li>
        <li>Clarified the 1965 Act by underscoring the fact that the URA was to grant ¾ rather than 2/3 contribution to renewal projects in areas suffering from persistent unemployment</li>
      </ul>
      <p>The broader act was intended to encourage cities to better coordinate the many federal programs at work in their communities.</p>

      <h3>1974 Housing and Community Development Act of 1974</h3>
      <ul>
        <li>The Act consolidated 10 categorical grant programs including Urban Renewal and a number of programs of Lyndon Johnson’s War on Poverty into a block grant.</li>
        <li>The new Community Development Block Grant program authorized block grant funding for communities of 50,000 or more residents and based its allocation rates on population, the extent of housing overcrowding, and poverty</li>
        <li>Cities could apply for funding by identifying community development needs, offering a program to meet those needs, offer a housing assistance plan, indicate compliance with various civil rights acts, and certify that citizens had an opportunity to weigh in on the application process</li>
        <li>Funds could then be used to acquire land, clear slums,  construct public facilities as well parks and recreation centers, improve infrastructure, historic preservation, or deliver funds to local health, social welfare, education or other community services to meet urgent needs</li>
        <li>In 1975, the CDBG program was authorized with $2.95 billion</li>
      </ul>
 

    `
  },

  setShow: function (subject) {
    this.data.modal = {
      open: (subject !== null),
      subject: subject
    };
    this.emit(AppActionTypes.storeChanged);
  },

  getModalContent: function() {
    return (this.data.modal.open) ? this.parseModalCopy(this.data[this.data.modal.subject]) : null;
  },

  getSubject: function () {
    return this.data.modal.subject;
  },

  mainModalIsOpen: function() {
    return this.data.modal.open;
  },

  parseModalCopy (modalCopy) {
    try {

      // replace the date
      const objToday = new Date(),
        months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
      modalCopy = modalCopy.replace('{THE_DATE}', months[objToday.getMonth()] + ' ' + objToday.getDate() + ', ' + objToday.getFullYear());

      // replace the URL
      modalCopy = modalCopy.replace('{THE_URL}', window.location.href);
    } catch (error) {
      console.warn('Error parsing modal copy: ' + error);
      modalCopy = 'Error parsing modal copy.';
    }

    // React requires this format to render a string as HTML,
    // via dangerouslySetInnerHTML.
    return {
      __html: modalCopy
    };
  }

};

// Mixin EventEmitter functionality
Object.assign(TextsStore, EventEmitter.prototype);

// Register callback to handle all updates
AppDispatcher.register((action) => {

  switch (action.type) {

  case AppActionTypes.loadInitialData:
    if (action.hashState.text) {
      TextsStore.setShow(action.hashState.text);
    }
    break;

  case AppActionTypes.onModalClick:
    // toggle of when the same text is requested
    console.log(action);
    TextsStore.setShow((action.subject !== TextsStore.getSubject()) ? action.subject : null);
    break;

  }
  return true;
});

export default TextsStore;