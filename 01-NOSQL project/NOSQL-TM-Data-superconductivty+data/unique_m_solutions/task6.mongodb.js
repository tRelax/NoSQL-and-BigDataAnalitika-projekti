use('test');

db.emb2_superconductivity_unique_m.drop();

var currColl = db.emb2_superconductivity_unique_m;
var oldColl = db.unique_m;
var moreInfo = db.statistika_superconductivity_unique_m;

oldColl.find().forEach(doc => {
  const emb2Doc = Object.assign({ _id: doc._id }, doc);
  currColl.insertOne(emb2Doc);
});

if(moreInfo.countDocuments() > 0){
  oldColl.find().forEach(doc => {
    moreInfo.find().forEach(docFreq =>{
      //console.log(`docFreq.name = ${docFreq.name}; doc[docFreq.name] = ${doc[docFreq.name]}; docFreq.values[doc[docFreq.name]] = ${docFreq.values[doc[docFreq.name]]}`);
      var value = doc[docFreq.varijabla];
      var avg = docFreq.srednja_vrijednost;
      var stddev = docFreq.standardna_devijacija;
      var nomissing = docFreq.broj_nomissing_elemenata;
      var tempMap = {
          "vrijednost": value,
          "srednja_vrijednost": avg,
          "standardna_devijacija": stddev,
          "broj_nomissing_elemenata": nomissing,
      };
      currColl.updateOne({ _id: doc._id}, {$set: {[docFreq.varijabla]:tempMap}});
    })
  });
}

//cca ~ 29min [20k+ documents, 88 props]