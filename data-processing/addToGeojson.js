// this adds state and district data to the simplified geojson files for each congress

const fs = require('fs');
const d3 = require('d3');
const GeojsonArea = require('@mapbox/geojson-area');
const Polylabel = require('polylabel');

const iDir = './simplified-geojson/';

const elections = JSON.parse(fs.readFileSync('../data/elections.json'));

const stateAbbrs = [
  { state: 'Alabama', abbreviation: 'Ala.', postalCode: 'AL' },
  { state: 'Alaska', abbreviation: 'Alaska', postalCode: 'AK' },
  { state: 'Arizona', abbreviation: 'Ariz.', postalCode: 'AZ' },
  { state: 'Arkansas', abbreviation: 'Ark.', postalCode: 'AR' },
  { state: 'California', abbreviation: 'Calif.', postalCode: 'CA' },
  { state: 'Colorado', abbreviation: 'Colo.', postalCode: 'CO' },
  { state: 'Connecticut', abbreviation: 'Conn.', postalCode: 'CT' },
  { state: 'Delaware', abbreviation: 'Del.', postalCode: 'DE' },
  { state: 'District of Columbia', abbreviation: 'D.C.', postalCode: 'DC' },
  { state: 'Florida', abbreviation: 'Fla.', postalCode: 'FL' },
  { state: 'Georgia', abbreviation: 'Ga.', postalCode: 'GA' },
  { state: 'Guam', abbreviation: 'Guam', postalCode: 'GU' },
  { state: 'Hawaii', abbreviation: 'Hawaii', postalCode: 'HI' },
  { state: 'Idaho', abbreviation: 'Idaho', postalCode: 'ID' },
  { state: 'Illinois', abbreviation: 'Ill.', postalCode: 'IL' },
  { state: 'Indiana', abbreviation: 'Ind.', postalCode: 'IN' },
  { state: 'Iowa', abbreviation: 'Iowa', postalCode: 'IA' },
  { state: 'Kansas', abbreviation: 'Kans.', postalCode: 'KS' },
  { state: 'Kentucky', abbreviation: 'Ky.', postalCode: 'KY' },
  { state: 'Louisiana', abbreviation: 'La.', postalCode: 'LA' },
  { state: 'Maine', abbreviation: 'Maine', postalCode: 'ME' },
  { state: 'Maryland', abbreviation: 'Md.', postalCode: 'MD' },
  { state: 'Massachusetts', abbreviation: 'Mass.', postalCode: 'MA' },
  { state: 'Michigan', abbreviation: 'Mich.', postalCode: 'MI' },
  { state: 'Minnesota', abbreviation: 'Minn.', postalCode: 'MN' },
  { state: 'Mississippi', abbreviation: 'Miss.', postalCode: 'MS' },
  { state: 'Missouri', abbreviation: 'Mo.', postalCode: 'MO' },
  { state: 'Montana', abbreviation: 'Mont.', postalCode: 'MT' },
  { state: 'Nebraska', abbreviation: 'Nebr.', postalCode: 'NE' },
  { state: 'Nevada', abbreviation: 'Nev.', postalCode: 'NV' },
  { state: 'New Hampshire', abbreviation: 'N.H.', postalCode: 'NH' },
  { state: 'New Jersey', abbreviation: 'N.J.', postalCode: 'NJ' },
  { state: 'New Mexico', abbreviation: 'N.M.', postalCode: 'NM' },
  { state: 'New York', abbreviation: 'N.Y.', postalCode: 'NY' },
  { state: 'North Carolina', abbreviation: 'N.C.', postalCode: 'NC' },
  { state: 'North Dakota', abbreviation: 'N.D.', postalCode: 'ND' },
  { state: 'Ohio', abbreviation: 'Ohio', postalCode: 'OH' },
  { state: 'Oklahoma', abbreviation: 'Okla.', postalCode: 'OK' },
  { state: 'Oregon', abbreviation: 'Ore.', postalCode: 'OR' },
  { state: 'Pennsylvania', abbreviation: 'Pa.', postalCode: 'PA' },
  { state: 'Puerto Rico', abbreviation: 'P.R.', postalCode: 'PR' },
  { state: 'Rhode Island', abbreviation: 'R.I.', postalCode: 'RI' },
  { state: 'South Carolina', abbreviation: 'S.C.', postalCode: 'SC' },
  { state: 'South Dakota', abbreviation: 'S.D.', postalCode: 'SD' },
  { state: 'Tennessee', abbreviation: 'Tenn.', postalCode: 'TN' },
  { state: 'Texas', abbreviation: 'Tex.', postalCode: 'TX' },
  { state: 'Utah', abbreviation: 'Utah', postalCode: 'UT' },
  { state: 'Vermont', abbreviation: 'Vt.', postalCode: 'VT' },
  { state: 'Virginia', abbreviation: 'Va.', postalCode: 'VA' },
  { state: 'Virgin Islands', abbreviation: 'V.I.', postalCode: 'VI' },
  { state: 'Washington', abbreviation: 'Wash.', postalCode: 'WA' },
  { state: 'West Virginia', abbreviation: 'W.Va.', postalCode: 'WV' },
  { state: 'Wisconsin', abbreviation: 'Wis.', postalCode: 'WI' },
  { state: 'Wyoming', abbreviation: 'Wyo.', postalCode: 'WY' }
];

const getStateName = function (abbr) {
  return stateAbbrs.find(s => s.postalCode === abbr).state;
};

const yearForCongress = function (congress) { return 1786 + congress * 2; };

const projection = d3.geoAlbersUsa();
const path = d3.geoPath().projection(projection);

fs.readdir(iDir, (err, files) => {
  if (err) {
    console.warn('err');
  }

  files.forEach((file) => {
    if (file.includes('.json')) {
      const theGeojson = JSON.parse(fs.readFileSync(`${iDir}/${file}`, 'utf8'));

      const year = yearForCongress(parseInt(file));

      if (elections[year]) {
        theGeojson.features.forEach((feature, i) => {
          // find the state and district number
          Object.keys(elections[year]).forEach((state) => {
            Object.keys(elections[year][state]).forEach((district) => {
              if (elections[year][state][district].id === feature.properties.ID) {
                // find the label position
                let point = null;
                if (feature.geometry) {
                  let iOfLargest = 0;
                  if (feature.geometry.type === 'MultiPolygon') {
                    let largest = 0;
                    feature.geometry.coordinates.forEach((coordinates, j) => {
                      const area = GeojsonArea.geometry({ type: 'Polygon', coordinates: coordinates });
                      if (area > largest) {
                        iOfLargest = j;
                        largest = area;
                      }
                    });
                  }

                  let theCoords = null;
                  if (feature.geometry.type === 'MultiPolygon') {
                    theCoords = feature.geometry.coordinates[iOfLargest];
                  } else if (feature.geometry.type === 'Polygon') {
                    theCoords = feature.geometry.coordinates;
                  }

                  if (theCoords) {
                    const labelCoords = Polylabel(theCoords, 0.1);
                    const pathD = path({ type: 'Point', coordinates: [labelCoords[0], labelCoords[1]] });
                    point = [parseFloat(pathD.substr(1, 7)), parseFloat(pathD.substr(pathD.indexOf(',') + 1, 7))];
                    point = point.map(d => d / projection.scale());
                  }
                }

                theGeojson.features[i].properties = {
                  id: feature.properties.ID,
                  statename: getStateName(state.toUpperCase()),
                  district: district,
                  endcong: parseInt(feature.properties.ENDCONG),
                  startcong: parseInt(feature.properties.STARTCONG),
                  area: (feature.geometry) ? GeojsonArea.geometry(feature.geometry) * 0.00000038610 : null,
                  labelPos: point
                };

                if (!feature.geometry) {
                  //console.log(feature.properties.id);
                }
              }
            });
          });
        });

        fs.writeFileSync(`./processed-simplified-geojson/${file}`, JSON.stringify(theGeojson));
      }
    }
  });
});
