const fs = require('fs');
const mapshaper = require('mapshaper');

const iDir = './full-geojson/';

const showError = (err) => {
  if (err) {
    console.error(err);
  }
};

const stateJS = "var fipsLookup = { n001: 'Alabama', n002: 'Alaska', n004: 'Arizona', n005: 'Arkansas', n006: 'California', n008: 'Colorado', n009: 'Connecticut', n010: 'Delaware', n011: 'District of Columbia', n012: 'Florida', n013: 'Geogia', n015: 'Hawaii', n016: 'Idaho', n017: 'Illinois', n018: 'Indiana', n019: 'Iowa', n020: 'Kansas', n021: 'Kentucky', n022: 'Louisiana', n023: 'Maine', n024: 'Maryland', n025: 'Massachusetts', n026: 'Michigan', n027: 'Minnesota', n028: 'Mississippi', n029: 'Missouri', n030: 'Montana', n031: 'Nebraska', n032: 'Nevada', n033: 'New Hampshire', n034: 'New Jersey', n035: 'New Mexico', n036: 'New York', n037: 'North Carolina', n038: 'North Dakota', n039: 'Ohio', n040: 'Oklahoma', n041: 'Oregon', n042: 'Pennsylvania', n044: 'Rhode Island', n045: 'South Carolina', n046: 'South Dakota', n047: 'Tennessee', n048: 'Texas', n049: 'Utah', n050: 'Vermont', n051: 'Virginia', n053: 'Washington', n054: 'West Virginia', n055: 'Wisconsin', n056: 'Wyoming' } ";

fs.readdir(iDir, (err, files) => {
  showError(err);
  files.forEach((file, i) => {
    if (file.includes('114.json')) {
      // find at large/general ticket elections to exclude
      // if they share a boundary with an enumerated district it screws up the cleaning
      const theGeojson = JSON.parse(fs.readFileSync(`${iDir}/${file}`, 'utf8'));
      let exclude = [];
      theGeojson.features.forEach((d) => {
        if (d.properties.ID.slice(-3) === '000') {
          const stateFIPS = d.properties.ID.slice(0, 3);
          let shouldExclude = false;
          theGeojson.features.forEach((d1) => {
            if (d1.properties.ID.slice(0, 3) === stateFIPS && d1.properties.ID.slice(-3) !== '000') {
              shouldExclude = true;
            }
          });
          if (shouldExclude) {
            exclude.push(d.properties.ID);
          }
        }
      });

      console.log(`processing: ${file}`);
      const congressNum = parseInt(file.slice(9, -5));
      const mapshaperOptions = [
        `-i ${iDir}/${file}`,
        'snap',
        '-simplify weighted 1%',
        `-filter '!${JSON.stringify(exclude)}.includes(ID)'`,
        '-clean',
        'keep-shapes',
        `-each '${[
          'id=ID',
          'delete ID',
          'startcong=parseInt(STARTCONG)',
          'delete STARTCONG',
          'endcong=parseInt(ENDCONG)',
          'delete ENDCONG',
          'district=parseInt(id.slice(-3))',
          'delete Shape_Area',
          'delete Shape_Leng',
          'fips=id.slice(0,3)'
        ].join(', ')}'`,
        `-o precision=0.001 ./simplified-geojson/${congressNum}-notAL.json format=geojson`
      ];
      //console.log(mapshaperOptions.join(' '));
      mapshaper.runCommands(mapshaperOptions.join(' '), showError);

      // const simplified = JSON.parse(fs.readFileSync(`./simplified-geojson/${congressNum}.json`, 'utf8'));
      // console.log(simplified);
      const fipses = JSON.stringify(exclude.map(id => id.slice(0, 3)));
      const mapshaperOptions2 = [
        `-i ./simplified-geojson/${congressNum}-notAL.json`,
        `-filter '${fipses}.includes(fips)'`,
        `-dissolve fips`,
        `-each '${[
          `id=${JSON.stringify(exclude)}.find(id=>id.slice(0,3)===fips)`,
          `startcong=parseInt(${JSON.stringify(exclude)}.find(id=>id.slice(0,3)===fips).slice(3,6))`,
          `endcong=parseInt(${JSON.stringify(exclude)}.find(id=>id.slice(0,3)===fips).slice(6,9))`,
          'district=0'
        ].join(', ')}'`,
        `-o precision=0.001 ./simplified-geojson/${congressNum}-AL.json format=geojson`
      ];

      //console.log(mapshaperOptions2.join(' '));
      mapshaper.runCommands(mapshaperOptions2.join(' '), showError);

      // combine the files
      const mapshaperOptionsCombine = [
        `-i ./simplified-geojson/${congressNum}-notAL.json ./simplified-geojson/${congressNum}-AL.json combine-files`,
        '-rename-layers enum,al',
        '-merge-layers target=enum,al name=merged',
        `-o ./simplified-geojson/${congressNum}.json format=geojson target=merged`
      ];
      mapshaper.runCommands(mapshaperOptionsCombine.join(' '), showError);
    }
  }, 0 * i);z
});
