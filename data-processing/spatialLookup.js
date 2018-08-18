var spatialIds = require('./idMap.json');

var lookups = {};
Object.keys(spatialIds).forEach(spatialId => {
	Object.keys(spatialIds[spatialId]).forEach(congress => {
		var year=1786 + congress * 2;
		lookups[year] = lookups[year] || {}; 
		 lookups[year][spatialIds[spatialId][congress]] = spatialId;
	});
});

console.log(JSON.stringify(lookups));