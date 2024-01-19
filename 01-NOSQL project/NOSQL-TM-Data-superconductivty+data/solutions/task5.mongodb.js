use('test');

db.emb1_superconductivity_train.drop();

var currColl = db.emb1_superconductivity_train;

var docs = db.empty_test.find();
var moreInfo = db.frekvencija_superconductivity_train.find();

db.empty_test.find().forEach(doc => {
  const emb1Doc = Object.assign({ _id: doc._id }, doc);
  currColl.insertOne(emb1Doc);
});

db.empty_test.find().forEach(doc => {
  db.frekvencija_superconductivity_train.find().forEach(docFreq =>{
    //console.log(`docFreq.name = ${docFreq.name}; doc[docFreq.name] = ${doc[docFreq.name]}; docFreq.values[doc[docFreq.name]] = ${docFreq.values[doc[docFreq.name]]}`);
    var value = doc[docFreq.varijabla];
    var frequency = docFreq.pojavnost[doc[docFreq.varijabla]];
    var tempMap = {
        "vrijednost": value,
        "frekvencija": frequency
    };
    //console.log(tempMap);
    currColl.updateOne({ _id: doc._id}, {$set: {[docFreq.varijabla]:tempMap}});
  })
});
