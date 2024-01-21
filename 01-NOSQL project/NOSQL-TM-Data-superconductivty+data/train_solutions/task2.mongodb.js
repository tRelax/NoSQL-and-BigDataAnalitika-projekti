use('test');

var currCollection = db.train;

var continousProperties = [];
var valuesOfProperties = [];
var mapOfAvgValues = {};

var insertionFlag = true;

function getProperties(){
    console.log("Getting properties!");
    const firstDocument = currCollection.findOne();
    if(firstDocument){
        for(const key in firstDocument){
        if(firstDocument.hasOwnProperty(key) && key != "_id"){
            var tempValue = currCollection.findOne({[key]: { $exists: true, $ne: "" }}, { _id: 0, [key]: 1 })
            
            if (tempValue) {
            const val = tempValue[key];
                if (typeof val === 'number') {
                    continousProperties.push(key);
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

function getMoreInfoFromContinousProps(){
    console.log("Getting more info for continual properties!");

    const new_collection = "statistika_superconductivity_train";

    if(!db.getCollectionNames().includes(new_collection)){
        console.log("Collection doesn't exist! Creating new!")
        db.createCollection(new_collection);
    }
    const tempCollectionAccess = db.statistika_superconductivity_train;

    continousProperties.forEach((property) => {
        var groupStage = {
        $group: {
            _id: null,
            varijabla: { $first: { $literal: property } },
            //if condition (prop != "") is met -> value is $prop, else is null
            srednja_vrijednost: { $avg: { $cond: [{ $ne: ["$" + property, "-1"] }, "$" + property, null] } },
            standardna_devijacija: { $stdDevPop: { $cond: [{ $ne: ["$" + property, "-1" ]}, "$" + property, null] } },
            broj_nomissing_elemenata: { $sum: { $cond: [{ $ne: ["$" + property, "-1" ]}, 1, 0] } }
        }
        };
        let avgVal = currCollection.aggregate([groupStage]).toArray()[0].srednja_vrijednost;
        //console.log(`[${property}] -> ` + avgVal);
        valuesOfProperties.push(currCollection.aggregate([groupStage]).toArray()[0]);
        mapOfAvgValues[property] = avgVal;
    });
    /* mapOfAvgValues.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    }); */

    if(insertionFlag){
        if(valuesOfProperties.length > 0){
        deleteAllDocs(tempCollectionAccess);
        tempCollectionAccess.insertMany(valuesOfProperties);
        }
    }

    console.log("DONE with getting more info for continual properties!\n");
}

getProperties();
getMoreInfoFromContinousProps();