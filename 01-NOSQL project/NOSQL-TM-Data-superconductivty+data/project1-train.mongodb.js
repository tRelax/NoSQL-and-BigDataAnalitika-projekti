// Select the database to use.
use('test');

var collection = db.train;

var properties = [];
var values_of_properties = [];
var documentsWithEmptyAttr = [];

function getProperties(){
  console.log("Getting properties!");
  const firstDocument = collection.findOne();
  if(firstDocument){
    for(const key in firstDocument){
      if(firstDocument.hasOwnProperty(key) && key != "_id"){
        properties.push(key);
      }
    }
    console.log("DONE with getting properties!\n");
  } else {
    console.error("Collection is empty!");
  }
}

function getMoreInfoFromContinualProperties(){
  console.log("Getting more info for continual properties!");
  properties.forEach((property) => {
    var groupStage = {
      $group: {
          _id: null,
          //if condition (prop != "") is met -> value is $prop, else is null
          avgValue: { $avg: { $cond: [{ $ne: ["$" + property, ""] }, "$" + property, null] } },
          stdDevValue: { $stdDevPop: { $cond: [{ $ne: ["$" + property, "" ]}, "$" + property, null] } },
          count: { $sum: { $cond: [{ $ne: ["$" + property, "" ]}, 1, 0] } }
      }
    };
    values_of_properties.push(collection.aggregate([groupStage]).toArray()[0]);
  });
  console.log("DONE with getting more info for continual properties!\n");
}

function printPropertiesStats(){
  console.log("Printing info for continual properties!");
  values_of_properties.forEach((result, index) => {
    console.log(`Property: ${properties[index]}`);
    console.log("Average: " + result.avgValue);
    console.log("Standard Deviation: " + result.stdDevValue);
    console.log("Number of Elements: " + result.count);
    console.log("-----------");
  });
  console.log("DONE with printing info for continual properties!\n");
}

function findAndFixEmptyProperties(){
  console.log("Finding and fixing empty properties!");
  //console.log(documentsWithEmptyAttr.length);
  db.train.find().forEach((data) => {
    properties.forEach(element => {
      const updateQuery = {};
      if(data[element] === "" || data[element] === null){
        updateQuery[`$set`] = { [element]: "-1"};
        console.log(data[element])
        documentsWithEmptyAttr.push(data);
        db.train.updateOne(data, updateQuery);
      }
    });
  });
  //console.log(documentsWithEmptyAttr.length);
  console.log("DONE with finding and fixing empty properties!\n");
}

function printPotentialCategoricProperties(){
  console.log("Finding and printing potential categoric properties!");
  properties.forEach((property) => {
    const distinctValues = collection.distinct(property);

    if (distinctValues.length <= 100){
      console.log(`Distinct Values for [${property}] => ` + distinctValues.length);
    }
  })
  console.log("DONE with finding and printing potential categoric properties!\n");
}

getProperties();

//categoric values
/*
number_of_elements
[
  1, 2, 3, 4, 5,
  6, 7, 8, 9
],
mean_Valence
[
                 1,             1.25, 1.33333333333333,              1.5,
  1.66666666666667,             1.75,              1.8, 1.83333333333333,
                 2, 2.14285714285714, 2.16666666666667,              2.2,
              2.25, 2.28571428571429, 2.33333333333333,            2.375,
               2.4, 2.42857142857143,              2.5, 2.55555555555556,
  2.57142857142857,              2.6, 2.66666666666667, 2.71428571428571,
              2.75,              2.8, 2.83333333333333, 2.85714285714286,
             2.875,                3, 3.14285714285714, 3.16666666666667,
               3.2,             3.25, 3.28571428571429, 3.33333333333333,
               3.4, 3.42857142857143,              3.5, 3.57142857142857,
               3.6, 3.66666666666667,             3.75,              3.8,
  3.83333333333333,                4,              4.2,             4.25,
  4.33333333333333,              4.4,              4.5, 4.66666666666667,
              4.75,                5,             5.25, 5.33333333333333,
               5.5, 5.66666666666667,             5.75,                6,
  6.33333333333333,              6.5,                7
],
range_Valence 
[
  0, 1, 2, 3,
  4, 5, 6
]
*/
printPotentialCategoricProperties();

//printjson(values_of_properties);
getMoreInfoFromContinualProperties();
//printPropertiesStats();

findAndFixEmptyProperties();


