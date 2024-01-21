/* 
7.	
Iz tablice emb2 izvući sve one srednje vrijednosti iz nizova čija je 
standardna devijacija 10% > srednje vrijednosti 
koristeći $set modifikator 
    
*/

use('test')

//db.embX_superconductivity_unique_m.drop();

var currColl = db.emb2_superconductivity_unique_m;
var pastColl = db.unique_m;

console.log(currColl.countDocuments());

var continousProperties = [];
var valuesOfProperties = [];
var mapOfAvgValues = {};

function getProperties(){
    console.log("Getting properties!");
    const firstDocument = pastColl.findOne();
    if(firstDocument){
        for(const key in firstDocument){
        if(firstDocument.hasOwnProperty(key) && key != "_id"){
            var tempValue = pastColl.findOne({[key]: { $exists: true, $ne: "" }}, { _id: 0, [key]: 1 })
            
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

/* db.emb2_superconductivity_unique_m.find().forEach(doc => {
    const emb2Doc = Object.assign({ _id: doc._id }, doc);
    currColl.insertOne(emb2Doc);
}); */

function task7(){
    currColl.find().forEach((doc) =>{
        var tempMap = {};
        continousProperties.forEach((prop) => {
            var avg = doc[prop].srednja_vrijednost;
            var std_dev = doc[prop].standardna_devijacija;
            //console.log(avg + std_dev);
            if(std_dev > (avg * 1.1)){
                tempMap[prop] = avg;
            }
        });
        //console.log(tempMap);
        currColl.updateOne({ _id: doc._id}, {$set: {"dev_over_avg":tempMap}});
    })
    
}

getProperties();
task7();
