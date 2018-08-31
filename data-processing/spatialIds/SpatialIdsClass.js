const EventEmitter = require('events');
const d3 = require('d3');
const fs = require('fs');
const elections = require('./data/elections.json');
const states = require('./data/states.json');

const SpatialIds = class SpatialIdsClass extends EventEmitter {
  constructor () {
    super();

    this.districtsToSkip = {};
    this.ALDistrictIds = {};
    this.yearsToSkip = {};
    this.toDos = {};
    this.mapping = {};
    this.candidates = {};
    this.spatialIds = {};
    this.lookups = {};
  }

  makeALDistrictsToIgnore () {
    // drop districts that aren't at large
    Object.keys(elections).forEach((year) => {
      Object.keys(elections[year]).forEach((state) => {
        const districtKeys = Object.keys(elections[year][state]);
        const hasAL = districtKeys.includes('AL') || districtKeys.includes('GT');
        if (hasAL) {
          const numAL = districtKeys.filter(d => d === 'AL').length;
          const numGT = districtKeys.filter(d => d === 'GT').length;
          const numEnumerated = districtKeys.filter(d => d !== 'AL' && d !== 'GT').length;
          // only skip if there are no enumerated districts (e.g. 1, 2, etc.) or multiple AL districts
          const skip = (numGT > 0 || numAL > 1 || numEnumerated > 0);
          if (skip) {
            if (Object.keys(elections[year][state]).includes('AL')) {
              this.districtsToSkip[year] = this.districtsToSkip[year] || [];
              elections[year][state].AL.forEach((d, i) => {
                this.ALDistrictIds[year] = this.ALDistrictIds[year] || {};
                this.ALDistrictIds[year][d.id] = numAL + numGT;

                if (!this.districtsToSkip[year].includes(d.id)) {
                  this.districtsToSkip[year].push(d.id);
                }
              });
            }
            if (Object.keys(elections[year][state]).includes('GT')) {
              this.districtsToSkip[year] = this.districtsToSkip[year] || [];
              elections[year][state].GT.forEach((d) => {
                this.ALDistrictIds[year] = this.ALDistrictIds[year] || {};
                this.ALDistrictIds[year][d.id] = numAL + numGT;

                if (!this.districtsToSkip[year].includes(d.id)) {
                  this.districtsToSkip[year].push(d.id);
                }
              });
            }
          }
        }
      });
    });

    console.log('CALCULATED districtsToSkip');

    this.emit('districtsToSkipCalculated');
  }

  calculateYearsToSkip () {
    // drop districts that aren't at large
    Object.keys(elections).forEach((year) => {
      Object.keys(elections[year]).forEach((state) => {
        if (Object.keys(elections[year][state]).includes('0')) {
          this.yearsToSkip[year] = this.yearsToSkip[year] || [];
          this.yearsToSkip[year].push(state);
        }
      });
    });

    // go through the states with at large elections and drop those that persist across subsequent elections
    Object.keys(this.yearsToSkip).forEach((year) => {
      this.yearsToSkip[year].forEach((state) => {
        if (this.yearsToSkip[parseInt(year) + 2] && this.yearsToSkip[parseInt(year) + 2].includes(state)) {
          // keep removing the state until you don't find it in an election
          let removing = true;
          let yearToRemove = parseInt(year);
          while (removing) {
            this.yearsToSkip[yearToRemove] = this.yearsToSkip[yearToRemove].filter(s => s !== state && s !== 'DC');
            yearToRemove += 2;
            removing = !this.yearsToSkip[yearToRemove].includes(state);
          }
        }
      });
      if (this.yearsToSkip[year].length === 0) {
        delete (this.yearsToSkip[year]);
      }
    });

    // go back through this list and eliminate states that have multiple districts for that year
    Object.keys(this.yearsToSkip).forEach((year) => {
      this.yearsToSkip[year].forEach((state) => {
        if (Object.keys(elections[year][state]).length > 1) {
          this.yearsToSkip[year] = this.yearsToSkip[year].filter(s => s !== state);
        }
      });
      if (this.yearsToSkip[year].length === 0) {
        delete (this.yearsToSkip[year]);
      }
    });

    console.log('CALCULATED yearsToSkip');

    this.emit('yearsToSkipCalculated');
  }

  /*
    This methods queries for a list of state and congress numbers where there was an endcong for
    the district. If there wasn't an endcong then all the districts in the state persisted to the
    next congress; i.e. they're the same district and don't need to be compared.
  */
  makeToDos () {
    d3.json('https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=select distinct (statename, endcong), endcong as congress, statename from districts order by congress, statename', (err, d) => {
      if (err) { console.log(err); }

      d.rows.forEach((toDo) => {
        this.toDos[toDo.congress] = this.toDos[toDo.congress] || [];
        this.toDos[toDo.congress].push(toDo.statename);
        // skip years where there were at large districts usually avoiding redistricting
        // if (!this.yearsToSkip[this.yearForCongress(toDo.congress)] 
        //   || !this.yearsToSkip[this.yearForCongress(toDo.congress)].includes(this.getStateAbbr(toDo.statename))) {
        //   this.toDos[toDo.congress] = this.toDos[toDo.congress] || [];
        //   this.toDos[toDo.congress].push(toDo.statename);
        // }
      });

      console.log('CALCULATED toDos');

      this.emit('toDosCompleted');
    });
  }

  /*
    This creates the preliminary mapping that consists of identical, unchanged districts across
    elections. Real simple--just uses startcong and endcong numbers.
  */
  makePreliminaryMapping () {
    const query = 'https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=SELECT distinct on (id) id, statename, district, startcong, endcong FROM districts';

    const mapping = [];

    d3.json(query, (err, d) => {
      if (err) { return console.log(err); }
      // obviously, if the district spans multiple years/congresses, the mapping is to itself
      const stateLookup = {};
      d.rows.forEach((district) => {
        for (let congress = district.startcong; congress <= district.endcong; congress++) {
          const year = this.yearForCongress(congress);
          let {
            id
          } = district;
          // add if it's not among the districts to skip--i.e. the at large districts
          if (!this.districtsToSkip[year] || !this.districtsToSkip[year].includes(id)) {
            mapping.push({
              congress: congress,
              state: district.statename,
              id: district.id,
              mapToId: (district.endcong > congress) ? district.id : null
            });
          } else {
            // record the state name
            stateLookup[id] = district.statename;
          }
        }
      });

      // add spatial ids for AL and GT districts
      //console.log(this.ALDistrictIds);
      Object.keys(this.ALDistrictIds).forEach((year) => {
        Object.keys(this.ALDistrictIds[year]).forEach((id) => {
          for (let x = 0; x < this.ALDistrictIds[year][id]; x++) {
            mapping.push({
              congress: this.congressForYear(year),
              state: stateLookup[id],
              id: `${id}-${x}`,
              mapToId: null
            });
          }
        });
      });

      mapping.sort((a, b) => {
        if (a.congress < b.congress) {
          return -1;
        } else if (a.congress > b.congress) {
          return 1;
        } else if (a.state < b.state) {
          return -1;
        } else if (a.state > b.state) {
          return 1;
        } else if (!a.mapToId && b.mapToId) {
          return -1;
        } else if (a.mapToId && !b.mapToId) {
          return 1;
        }
        return 0;
      });
      mapping.forEach((d2) => {
        const year = this.yearForCongress(d2.congress);
        this.mapping[year] = this.mapping[year] || {};
        this.mapping[year][d2.state] = this.mapping[year][d2.state] || {};
        this.mapping[year][d2.state][d2.id] = d2.mapToId;
      });

      console.log('CALCULATED preliminaryMapping');

      this.emit('preliminaryMappingCompleted');
    });
  }

  makeCandidates () {
    const baseUrlJson = 'https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=';

    Object.keys(this.toDos).forEach((congress, i) => {
      setTimeout(() => {
        const year = this.yearForCongress(congress);
        console.log(`CALCULATING CANDIDATES for Congress ${congress} (${year}`);

        const statesArray = this.toDos[congress].map(state => `'${state}'`).join(',');
        let districtArray = null;
        if (this.districtsToSkip[year]) {
          districtArray = this.districtsToSkip[year].map(d => `'${d}'`).join(',');
        }

        // get the percentage overlaps for each district that does intersect
        const queryOverlap = `select previous.id as previous_district, next.id as next_district, st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) * st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(next.the_geom) as overlap, previous.statename as state from (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename  FROM districts where endcong = ${congress} and statename in (${statesArray}) and district != 0 ${(districtArray) ? ` and district not in (${districtArray})` : ''}) previous join (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename FROM districts where startcong = ${parseInt(congress, 10) + 1} and statename in (${statesArray}) ${(districtArray) ? ` and district not in (${districtArray})` : ''}) next on previous.statename = next.statename and st_intersects(ST_CollectionExtract(previous.the_geom,3), ST_CollectionExtract(next.the_geom,3)) and st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) > 0.5 and st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(next.the_geom) > 0.05 order by overlap desc`;

        d3.json(baseUrlJson + queryOverlap, (err, cd) => {
          if (!cd) { 
            console.log(queryOverlap, err, cd);
          } else if (cd && cd.rows) {
            console.log(`CALCULATED candidates for Congress ${congress} (${year}`);
            console.log(cd.rows.length);
            this.candidates[this.yearForCongress(congress)] = cd.rows;
            delete this.toDos[congress];

            if (Object.keys(this.toDos).length === 0) {
              console.log('CALCULATED all candidates');

              this.emit('candidatesCompleted');
            }
          }
        });

      }, 500 * i);
    });
  }

  selectCandidates () {
    // iterate through each of these congresses and states producing the mappings
    fs.writeFile('./data/candidatestest.json', JSON.stringify(this.candidates));
    Object.keys(this.candidates).forEach((year, i) => {
      console.log(`starting Congress for ${year}`);
      console.log(`${this.candidates[year].length} matches to test`);

      let currentDistrictLists = Array.from(new Set(this.candidates[year].map(intersection => intersection.previous_district)));
      let candidatesList = Array.from(new Set(this.candidates[year].map(intersection => intersection.next_district)));
      let numMapped = 0;
      const numNeedingMapping = currentDistrictLists.length;

      // iterate through the results one by one assigning this.candidates
      this.candidates[year].forEach((intersection) => {
        if (currentDistrictLists.length > 0 && candidatesList.length > 0 && currentDistrictLists.includes(intersection.previous_district) && candidatesList.includes(intersection.next_district)) {
          // map the candidate
          this.mapping[year][intersection.state][intersection.previous_district] = intersection.next_district;

          // remove the mapped district and the potential candidate from the two respective lists
          currentDistrictLists = currentDistrictLists.filter(id => id !== intersection.previous_district);
          candidatesList = candidatesList.filter(id => id !== intersection.next_district);
          numMapped += 1;
        }
      });

      console.log(`mapped ${numMapped} of ${numNeedingMapping}`);
      console.log(`finished Congress for ${year}`);
      console.log(' ');
    });

    console.log('COMPLETED selecting candidates');

    this.emit('candidateSelectionCompleted');
  }

  assignSpatialIds () {
    let spatialId = 0;
    // initialize with the first congress's data
    console.log('initializing for 1788');
    Object.keys(this.mapping['1788']).forEach((state) => {
      Object.keys(this.mapping['1788'][state]).forEach((currentDistrict) => {
        this.spatialIds[`spatialId${spatialId}`] = { 1788: currentDistrict};
        if (this.mapping['1788'][state][currentDistrict]) {
          this.spatialIds[`spatialId${spatialId}`]['1790'] = this.mapping['1788'][state][currentDistrict];
        }
        spatialId += 1;
      });
    });
    delete this.mapping['1788'];

    Object.keys(this.mapping)
      .map(year => parseInt(year, 10))
      .sort((a, b) => a - b)
      .forEach((year) => {
        console.log('processing this.mapping for ' + year);

        Object.keys(this.mapping[year]).forEach((state) => {
          Object.keys(this.mapping[year][state]).forEach((currentDistrict) => {
            // check to see if you there's a match in the previous congress
            let previousSpatialId = false;
            Object.keys(this.spatialIds).forEach((spatialId) => {
              if (this.spatialIds[spatialId][year] && this.spatialIds[spatialId][year] === currentDistrict) {
                previousSpatialId = true;
                // add the next one if there's a this.mapping
                if (this.mapping[year][state][currentDistrict]) {
                  this.spatialIds[spatialId][year + 2] = this.mapping[year][state][currentDistrict];
                }
              }
            });
            // create a new spatialId
            if (!previousSpatialId) {
              this.spatialIds[`spatialId${spatialId}`] = {};
              this.spatialIds[`spatialId${spatialId}`][year] = currentDistrict;
              if (this.mapping[year][state][currentDistrict]) {
                this.spatialIds[`spatialId${spatialId}`][year + 2] = this.mapping[year][state][currentDistrict];
              }
              spatialId += 1;
            }
          });
        });
      });

      console.log('COMPLETED ASSIGNING spatialIds');

      this.emit('spatialIdsAssigned');
  }

  adjustForAtLarge () {
    const baseUrlJson = 'https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=';
    const candidates = {};

    Object.keys(this.yearsToSkip).forEach((year) => {
      const theYear = parseInt(year, 10);
      this.yearsToSkip[year].forEach((state) => {
        // create a mapping of best matched districts for the congress before the year and the one after, skipping it
        // note this is more choosy than the initial candidates, looking for 25% overlap or more
        const queryOverlap = `select previous.id as previous_district, next.id as next_district, st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) as overlap, previous.statename as state from (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename  FROM districts where endcong =  ${this.congressForYear(theYear - 2)} and statename = '${this.getStateName(state)}' and district != 0) previous join (SELECT distinct on (id) id, cartodb_id, st_makevalid(the_geom) as the_geom, statename FROM districts where startcong =  ${this.congressForYear(theYear + 2)} and statename = '${this.getStateName(state)}') next on previous.statename = next.statename and st_intersects(ST_CollectionExtract(previous.the_geom,3), ST_CollectionExtract(next.the_geom,3)) and st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(previous.the_geom) > 0.25 and st_area(st_intersection(previous.the_geom, next.the_geom))/st_area(next.the_geom) > 0.25 order by overlap desc`;

        d3.json(baseUrlJson + queryOverlap, (err, cd) => {
          if (!cd) { 
            console.log(queryOverlap, err, cd);
          } else if (cd && cd.rows) {
            candidates[theYear - 2] = candidates[theYear - 2] || {}
            candidates[theYear - 2][state] = cd.rows;
          }
          this.yearsToSkip[year] = this.yearsToSkip[year].filter(s => s !== state);
          if (this.yearsToSkip[year].length === 0) {
            delete this.yearsToSkip[year];
          }

          if (Object.keys(this.yearsToSkip).length === 0) {
            // iterate through each of these congresses and states adjusting the mappings
            // this needs to be done badkwards
            Object.keys(candidates).sort().reverse().forEach((year, i) => {
              Object.keys(candidates[year]).forEach((state) => {
                console.log(`starting ${state} for ${year}`);
                console.log(`${candidates[year][state].length} matches to test`);

                let currentDistrictLists = Array.from(new Set(candidates[year][state].map(intersection => intersection.previous_district)));
                let candidatesList = Array.from(new Set(candidates[year][state].map(intersection => intersection.next_district)));

                // iterate through the results one by one assigning candidates
                candidates[year][state].forEach((intersection) => {
                  if (currentDistrictLists.length > 0 && candidatesList.length > 0 && currentDistrictLists.includes(intersection.previous_district) && candidatesList.includes(intersection.next_district)) {
                    // find the spatial ids for the previous and next districts
                    const idToKeep = this.findSpatialId(intersection.previous_district, year);
                    const idToMerge = this.findSpatialId(intersection.next_district, parseInt(year) + 4);
                    if (idToKeep && idToMerge) {
                      Object.keys(this.spatialIds[idToMerge]).forEach((y) => {
                        this.spatialIds[idToKeep][y] = this.spatialIds[idToMerge][y];
                      });
                      delete this.spatialIds[idToMerge];
                    }

                    // remove the mapped district and the potential candidate from the two respective lists
                    currentDistrictLists = currentDistrictLists.filter(id => id !== intersection.previous_district);
                    candidatesList = candidatesList.filter(id => id !== intersection.next_district);
                  }
                });
              });
            });
            
            console.log('COMPLETED adjusting for at-large districts');

            this.emit('atLargeCompleted');
          }
        });
      });
    });
  }

  makeLookup () {
    Object.keys(this.spatialIds).forEach((spatialId) => {
      Object.keys(this.spatialIds[spatialId]).forEach((year) => {
        this.lookups[year] = this.lookups[year] || {};
        this.lookups[year][this.spatialIds[spatialId][year]] = spatialId;
      });
    });

    fs.writeFile('./data/spatialIds.json', JSON.stringify(this.lookups), function (err) {
      if (err) { return console.log(err); }
      console.log('The file was saved!');
      console.log('FINISHED MAKING lookup');
      console.log('finished');
    });
  }

  findSpatialId (districtId, year) {
    let theSpatialId;
    Object.keys(this.spatialIds).forEach((spatialId) => {
      if (this.spatialIds[spatialId][year] && this.spatialIds[spatialId][year] === districtId) {
        theSpatialId = spatialId;
      }
    });
    return theSpatialId;
  }

  yearForCongress (congress) {
    return 1786 + congress * 2;
  }

  congressForYear (year) {
    return d3.scaleLinear().domain([1788, 2030]).range([1, 122])(year); 
  }

  getStateAbbr (state) {
    return states.find(s => s.state.toLowerCase() === state.toLowerCase()).postalCode;
  }

  getStateName (code) {
    return states.find(s => s.postalCode === code).state;
  };
};


module.exports = SpatialIds;
