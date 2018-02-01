var fs = require('fs');
var districts= require('./districts.json');

districts.features.forEach(f => {
	if (f.properties.member) {
		delete f.properties.member;
	} 
	if (f.type != 'Feature') {
		console.log(f);
		jfkldsj
	}
});

//console.log(JSON.stringify(districts));