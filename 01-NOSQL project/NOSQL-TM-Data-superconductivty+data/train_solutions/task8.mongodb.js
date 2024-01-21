use('test')

var currCollection = db.train;

var properties = [];
var continousProperties = [];
var categoricProperties = [];

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

//getProperties();
//console.log(properties);

db.train.createIndex({number_of_elements: 1, mean_Valence:1, range_Valence: 1, critical_temp: 1});
db.train.find({number_of_elements: 5, mean_Valence: 2, range_Valence: 2, critical_temp: 26}).forEach((doc) =>{
    console.log(doc)
});
