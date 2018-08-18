const fs = require('fs');
const EventEmitter = require('events');
const mapshaper = require('mapshaper');

const iDir = './full-geojson/';

//class MyEmitter extends EventEmitter {}

const eventEmitter = new EventEmitter();

const showError = (err) => {
  if (err) {
    console.error(err);
  }
};

const exclude = {};
let congresses;

const watcher = fs.watch('./simplified-geojson', (eventType, filename) => {
  console.log(`created ${filename}`);

  const congress = parseInt(filename);
  if (filename.includes('-notAL')) {
    createAL(congress);
  } else if (filename.includes('-AL')) {
    createCombined(congress);
  } else if (congress < congresses[congresses.length - 1]) {
    // copy the file to final dir
    fs.createReadStream(`./simplified-geojson/${filename}`)
      .pipe(fs.createWriteStream(`./final-simplified-geojson/${filename}`));
    console.log(`copying ${filename} to ./final-simplified-geojson`);
    findExclusions(congress + 1);
  } else {
    fs.createReadStream(`./simplified-geojson/${filename}`)
      .pipe(fs.createWriteStream(`./final-simplified-geojson/${filename}`));
    console.log('DONE!!');
    watcher.close;
  }
});

eventEmitter.on('exclusionsFound', (congress) => {
  createNotAL(congress);
});

const getInfileName = function (congress) {
  let filename = `districts${congress}.json`;
  if (congress < 10) {
    filename = `districts00${congress}.json`;
  } else if (congress < 100) {
    filename = `districts0${congress}.json`;
  }
  return filename;
};

const findExclusions = function (congress) {
  console.log(`Finding at large districts for ${congress}`);
  const theGeojson = JSON.parse(fs.readFileSync(`${iDir}/${getInfileName(congress)}`, 'utf8'));
  const excludeThese = [];
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
        excludeThese.push(d.properties.ID);
      }
    }
  });

  if (excludeThese.length > 0) {
    exclude[congress] = excludeThese;
  }

  eventEmitter.emit('exclusionsFound', congress);
};

const createNotAL = function (congress) {
  const outfile = (exclude[congress]) ? `${congress}-notAL.json` : `${congress}.json`;
  console.log(`creating ${outfile}`);
  const filter = (exclude[congress]) ? `-filter '!${JSON.stringify(exclude[congress])}.includes(ID)'` : '';
  const mapshaperOptions = [
    `-i ${iDir}/${getInfileName(congress)}`,
    'snap',
    filter,
    '-simplify weighted 1%',
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
    `-o precision=0.001 ./simplified-geojson/${outfile} format=geojson`
  ];
  mapshaper.runCommands(mapshaperOptions.join(' '), showError);
};

const createAL = function (congress) {
  const outfile = `${congress}-AL.json`;
  console.log(`creating ${outfile}`);
  const fipses = JSON.stringify(exclude[congress].map(id => id.slice(0, 3)));
  const mapshaperOptions2 = [
    `-i ./simplified-geojson/${congress}-notAL.json`,
    `-filter '${fipses}.includes(fips)'`,
    `-dissolve fips`,
    `-each '${[
      `id=${JSON.stringify(exclude[congress])}.find(id=>id.slice(0,3)===fips)`,
      `startcong=parseInt(${JSON.stringify(exclude[congress])}.find(id=>id.slice(0,3)===fips).slice(3,6))`,
      `endcong=parseInt(${JSON.stringify(exclude[congress])}.find(id=>id.slice(0,3)===fips).slice(6,9))`,
      'district=0'
    ].join(', ')}'`,
    `-o precision=0.001 ./simplified-geojson/${outfile} format=geojson`
  ];
  mapshaper.runCommands(mapshaperOptions2.join(' '), showError);
};

const createCombined = function (congress) {
  const outfile = `${congress}.json`;
  console.log(`creating ${outfile}`);
  const mapshaperOptionsCombine = [
    `-i ./simplified-geojson/${congress}-notAL.json ./simplified-geojson/${congress}-AL.json combine-files`,
    '-rename-layers enum,al',
    '-merge-layers target=enum,al name=merged',
    `-o ./simplified-geojson/${outfile} format=geojson target=merged`
  ];
  mapshaper.runCommands(mapshaperOptionsCombine.join(' '), showError);
};

fs.readdir(iDir, (err, files) => {
  showError(err);
  congresses = files
    .filter(f => f.slice(-5) === '.json')
    .map(f => parseInt(f.slice(9, -5)))
    .sort((a, b) => a - b);

  findExclusions(congresses[0]);
});
