use('test');

var currCollection = db.train;

var properties = [];
var continousProperties = [];
var categoricProperties = [];

var mapOfAvgValues = {};

function getAvgValues(){
    continousProperties.forEach((property) => {
        var groupStage = {
            $group: {
                _id: null,
                avgValue: { $avg: { $cond: [{ $ne: ["$" + property, ""] }, "$" + property, null] } }
            }
        };
        let avgVal = currCollection.aggregate([groupStage]).toArray()[0].avgValue;
        mapOfAvgValues[property] = avgVal;
    })
    //console.log(mapOfAvgValues);
}

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
          
            if (typeof val === 'number' && key != "number_of_elements") {
              continousProperties.push(key);
            } else {
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

function deleteAllDocs(currCollection){
    console.log("DELETING!");
    currCollection.deleteMany({});
}

function separateHigherAvgValues(){
    console.log("Separating average values into 2 documents!");
  
    const new_collection = "statistika1_superconductivity_train";  
    const new_collection2 = "statistika2_superconductivity_train";  
  
    if(!db.getCollectionNames().includes(new_collection)){
      console.log("Collection doesn't exist! Creating new!")
      db.createCollection(new_collection);
    }
  
    if(!db.getCollectionNames().includes(new_collection2)){
      console.log("Collection doesn't exist! Creating new!")
      db.createCollection(new_collection2);
    }
    const tempCollectionAccess = db.statistika1_superconductivity_train;
    const tempCollectionAccess2 = db.statistika2_superconductivity_train;
  
    deleteAllDocs(tempCollectionAccess);
    deleteAllDocs(tempCollectionAccess2);
  
    //manji ili jednak od avg
    continousProperties.forEach((property) => {
      var propertyAvg = mapOfAvgValues[property];
  
      const pipeline = [
        {
          $match: {
            [property]: { $lte: propertyAvg }
          }
        },
        {
          $group: {
            _id: `${property}`,
            manji_ili_jednak: { $push: `$${property}` }
          }
        }
      ];
  
      var result = currCollection.aggregate(pipeline).toArray();
      if(result.length != 0){
        tempCollectionAccess.insertMany(result);
      }
    });
    
    //veci od avg
    continousProperties.forEach((property) => {
      var propertyAvg = mapOfAvgValues[property];
  
      const pipeline = [
        {
          $match: {
            [property]: { $gt: propertyAvg }
          }
        },
        {
          $group: {
            _id: `${property}`,
            veci: { $push: `$${property}` }
          }
        }
      ];
  
      var result = currCollection.aggregate(pipeline).toArray();
      if(result.length != 0){
        tempCollectionAccess2.insertMany(result);
      }
    });
  
      console.log("Done with separating average values into 2 documents!!\n");
}

getProperties();
getAvgValues();
separateHigherAvgValues();