use('test');

var currCollection = db.train;

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
  
    const new_collection = "frekvencija_superconductivity_train";  
  
    if(!db.getCollectionNames().includes(new_collection)){
      console.log("Collection doesn't exist! Creating new!")
      db.createCollection(new_collection);
    }
    const tempCollectionAccess = db.frekvencija_superconductivity_train;
    deleteAllDocs(tempCollectionAccess);
  
    var docs = currCollection.find().toArray();

    categoricProperties.forEach((property) => {
        //console.log(property);
        var resultDocument = {
              varijabla: property,
              pojavnost: {},
            }
        
        tempCollectionAccess.insertOne(resultDocument);

        docs.forEach((doc) =>{
            var preReplaceValue = doc[property];
            var prefix = "pojavnost.";

            var value = preReplaceValue.replace(/\./g,"_");

            tempCollectionAccess.updateMany(
                { varijabla: property },
                { "$inc": { [prefix + value]:1 } },
                { upsert: true }
            );
        });

  
    });
    console.log("Done with getting more info for categoric properties!\n");
}

getProperties();
getFrequenciesFromCategoricProps();