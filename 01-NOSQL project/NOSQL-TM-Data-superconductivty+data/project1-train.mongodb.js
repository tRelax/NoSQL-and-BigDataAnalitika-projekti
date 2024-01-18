// Select the database to use.
use('test');

var currCollection = db.train;

var properties = [];
var continousProperties = [];
var categoricProperties = [];

var valuesOfProperties = [];
var valuesOfContinousProps = [];
var valuesOfCategoricProps = [];
var mapOfAvgValues = new Map();
var mapOfFrequencies = new Map();

var insertionFlag = true;

var documentsWithEmptyAttr = [];

function roundTheNumber(num) {
  return +(Math.round(num + "e+5")  + "e-5");
}

//setting
function getProperties(){
  console.log("Getting properties!");
  const firstDocument = currCollection.findOne();
  if(firstDocument){
    for(const key in firstDocument){
      if(firstDocument.hasOwnProperty(key) && key != "_id"){
        properties.push(key);
        var tempValue = currCollection.findOne({[key]: { $exists: true, $ne: "" }}, { _id: 0, [key]: 1 })
        
        if (tempValue) {
          const val = tempValue[key];
        
          if (typeof val === 'number') {
            //print(`The value "${val}" is a number.`);
            continousProperties.push(key);
          } else {
            //print(`The value "${val}" is not a number.`);
            categoricProperties.push(key);
          }
        } else {
          print("No documents found in the collection.");
        }

      }
    }
    console.log("DONE with getting properties!\n");
  } else {
    console.error("Collection is empty!");
  }
}

//task 1
function findAndFixEmptyProperties(){
  console.log("Finding and fixing empty properties!");
  //console.log(documentsWithEmptyAttr.length);
  currCollection.find().forEach((data) => {
    continousProperties.forEach(element => {
      const updateQuery = {};
      if(data[element] === "" || data[element] === null){
        updateQuery[`$set`] = { [element]: "-1"};
        documentsWithEmptyAttr.push(data);
        currCollection.updateOne(data, updateQuery);
      }
    });
    categoricProperties.forEach(element => {
      const updateQuery = {};
      if(data[element] === "" || data[element] === null){
        updateQuery[`$set`] = { [element]: "empty"};
        documentsWithEmptyAttr.push(data);
        currCollection.updateOne(data, updateQuery);
      }
    });
  });
  //console.log(documentsWithEmptyAttr.length);
  console.log("DONE with finding and fixing empty properties!\n");
}

//task 2
function getMoreInfoFromContinousProps(){
  console.log("Getting more info for continual properties!");
  continousProperties.forEach((property) => {
    var groupStage = {
      $group: {
          _id: null,
          name: { $first: { $literal: property } },
          //if condition (prop != "") is met -> value is $prop, else is null
          avgValue: { $avg: { $cond: [{ $ne: ["$" + property, ""] }, "$" + property, null] } },
          stdDevValue: { $stdDevPop: { $cond: [{ $ne: ["$" + property, "" ]}, "$" + property, null] } },
          count: { $sum: { $cond: [{ $ne: ["$" + property, "" ]}, 1, 0] } }
      }
    };
    let avgVal = currCollection.aggregate([groupStage]).toArray()[0].avgValue;
    let roundedAvg = roundTheNumber(avgVal);
    //console.log(`[${property}] -> ` + avgVal);
    valuesOfProperties.push(currCollection.aggregate([groupStage]).toArray()[0]);
    mapOfAvgValues.set(property, avgVal);
  });
  /* mapOfAvgValues.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  }); */

  if(insertionFlag){
    const new_collection = "continous_props_info";
    db.createCollection(new_collection);
    const tempCollectionAccess = db.continous_props_info;
    // TODO: Change to only insert when there is nothing there, else it should update 
    tempCollectionAccess.insertMany(valuesOfProperties);
  }

  console.log("DONE with getting more info for continual properties!\n");
}

//task 3
function getFrequenciesFromCategoricProps(){
  console.log("Getting more info for categoric properties!\n");

  const new_collection = "categoric_props_frequencies";
  db.createCollection(new_collection);
  const tempCollectionAccess = db.categoric_props_frequencies;

  const docsToInsert = [];
  const processedProperties = new Set();

  categoricProperties.forEach((property) => {

    if (!processedProperties.has(property)) {

      var groupStage = {
        $group: {
          _id: "$"+property,
          count: { $sum: 1 }
        }
      };
      var projectStage = {
        $project: {
          _id: 0,
          name: property,
          values: { [property]: "$_id", count: "$count" }
        }
      };
      
      var groupResults = currCollection.aggregate([groupStage, projectStage]);
      
      var resultDocument = {
        name: property,
        values: {}
      };
      
      groupResults.forEach(function (doc) {
        resultDocument.values[doc.values[property]] = doc.values.count;
      });
      
      docsToInsert.push(resultDocument);
      processedProperties.add(property);
    }

  });
  if(docsToInsert.length != 0){
    // TODO: Change to only insert when there is nothing there, else it should update 
    tempCollectionAccess.insertMany(docsToInsert);
  }
  console.log("Done with getting more info for categoric properties!\n");
}

function printContinousPropertiesStats(){
  console.log("Printing info for continual properties!");
  valuesOfProperties.forEach((result, index) => {
    console.log(`Property: ${properties[index]}`);
    console.log(`Avg: ${roundTheNumber(result.avgValue)}\t | | Standard Deviation: ${roundTheNumber(result.stdDevValue)}\t | | Number of elements: ${result.count}`);
    console.log("-----------");
  });
  console.log("DONE with printing info for continual properties!\n");
}

function printPotentialCategoricProperties(){
  console.log("Finding and printing potential categoric properties!");
  properties.forEach((property) => {
    const distinctValues = currCollection.distinct(property);

    if (distinctValues.length <= 100){
      console.log(`Distinct Values for [${property}] => ` + distinctValues.length);
    }
  })
  console.log("DONE with finding and printing potential categoric properties!\n");
}

getProperties();

findAndFixEmptyProperties();

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
//printPotentialCategoricProperties();

getMoreInfoFromContinousProps();
getFrequenciesFromCategoricProps();

//printContinousPropertiesStats();

