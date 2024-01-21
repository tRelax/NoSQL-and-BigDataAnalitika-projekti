use('test');

var currCollection = db.unique_m;

var properties = [];
var continousProperties = [];
var categoricProperties = [];

var insertionFlag = true;

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

function getFrequenciesFromCategoricProps(){
    console.log("Getting more info for categoric properties!");
  
    const new_collection = "frekvencija_superconductivity_unique_m";  
  
    if(!db.getCollectionNames().includes(new_collection)){
      console.log("Collection doesn't exist! Creating new!")
      db.createCollection(new_collection);
    }
    const tempCollectionAccess = db.frekvencija_superconductivity_unique_m;
    deleteAllDocs(tempCollectionAccess);
  
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
            varijabla: property,
            pojavnost: { [property]: "$_id", count: "$count" }
          }
        };
        
        var groupResults = currCollection.aggregate([groupStage, projectStage]);
        
        var resultDocument = {
          varijabla: property,
          pojavnost: {}
        };
        
        groupResults.forEach(function (doc) {
          resultDocument.pojavnost[doc.pojavnost[property]] = doc.pojavnost.count;
        });
        
        docsToInsert.push(resultDocument);
        processedProperties.add(property);
      }
  
    });
  
    if(insertionFlag){
      if(docsToInsert.length != 0){
        tempCollectionAccess.insertMany(docsToInsert);
      }
    }
    console.log("Done with getting more info for categoric properties!\n");
}

getProperties();
getFrequenciesFromCategoricProps();