var turf = require('@turf/turf');
var allDistricts = require('./raw-data/districts5.json');

var states = [ 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming' ];
states = [states[0]];

var stateSlivers = {};

var poly1 = turf.polygon([[
  [-122.801742, 45.48565],
  [-122.801742, 45.60491],
  [-122.584762, 45.60491],
  [-122.584762, 45.48565],
  [-122.801742, 45.48565]
]]);

var poly2 = turf.polygon([[
  [-122.520217, 45.535693],
  [-122.64038, 45.553967],
  [-122.720031, 45.526554],
  [-122.669906, 45.507309],
  [-122.723464, 45.446643],
  [-122.532577, 45.408574],
  [-122.487258, 45.477466],
  [-122.520217, 45.535693]
]]);

console.log(JSON.stringify(poly1));

var intersectiontest = turf.intersect(poly1, poly2);

states.forEach(state => {
	stateSlivers[state] = [];
	var districts = allDistricts.features.filter(d => d.properties.statename == state);
	districts.forEach(district => {
		district = turf.cleanCoords(district);
		var type = "Feature";
		var properties = {};
		for (var cong = district.properties.startcong; cong <= district.properties.endcong; cong++) {
			properties[cong] = district.properties.id;
		}

		if (district.geometry.type == 'MultiPolygon') {
			district.geometry.coordinates.forEach(coords => {
				var geometry = {
					type: 'Polygon',
					coordinates: coords
				};

				stateSlivers[state].push({
					type: type,
					geometry: geometry,
					properties: properties
				});
			});
		} else {
			var geometry = district.geometry;
			stateSlivers[state].push({
				type: type,
				geometry: geometry,
				properties: properties
			});
		}
	});

	stateSlivers[state].forEach((district, i) => {
		if (i < stateSlivers[state].length) {
			stateSlivers[state]
				.slice(i+1)
				.forEach((sliver, i) => {
					var intersection = turf.intersect(district, sliver);
					if (intersection) {
						console.log(intersection);
					};
				});
		}
	});


	// if (aCongressDistricts.length > 0) {
	// 	// initialize if necessary
	// 	if (stateSlivers[state].length == 0) {
	// 		stateSlivers[state] = aCongressDistricts;
	// 	} else {

	// 	}
	// }
	// }

});