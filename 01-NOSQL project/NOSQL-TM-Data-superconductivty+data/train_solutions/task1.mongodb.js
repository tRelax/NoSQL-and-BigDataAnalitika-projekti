use('test');

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

getProperties();
findAndFixEmptyProperties();