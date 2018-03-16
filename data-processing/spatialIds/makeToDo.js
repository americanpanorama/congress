// queries carto to produce an object with years and states that require spatial mapping--i.e. that have different districts across election cycles

const d3 = require("d3"),  
	fs = require('fs');

d3.json("https://digitalscholarshiplab.carto.com/api/v2/sql?format=JSON&q=select distinct (statename, endcong), endcong as congress, statename from districts_1 order by congress, statename", (err, d) => {
  var toDos = {};
  d.rows.forEach(toDo => {
    toDos[toDo.congress] = toDos[toDo.congress] || [];
    toDos[toDo.congress].push(toDo.statename);
  });

  fs.writeFile("./data/toDos.json", JSON.stringify(toDos), function(err) {
      if(err) { return console.log(err); }
      console.log("The file was saved!");
  }); 
}); 
