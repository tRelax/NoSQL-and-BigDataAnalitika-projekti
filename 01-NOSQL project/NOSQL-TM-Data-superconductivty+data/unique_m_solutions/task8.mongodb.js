use('test')

var currCollection = db.unique_m;

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

//7 13 28
db.unique_m.createIndex({Be: 1, Ne:1, Cu: 1, critical_temp: 1});
db.unique_m.find({Be: 0, Ne:0, Cu: 0.9, critical_temp: 26}).forEach((doc) =>{
    console.log(doc)
});
