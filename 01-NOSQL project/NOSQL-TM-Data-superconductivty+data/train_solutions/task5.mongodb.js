use('test');

db.emb1_superconductivity_train.drop();

var currColl = db.emb1_superconductivity_train;
var oldColl = db.train;
var moreInfo = db.frekvencija_superconductivity_train;

oldColl.aggregate([{$out: "emb1_superconductivity_train"}]);

if(moreInfo.countDocuments() > 0){
  oldColl.find().forEach(doc => {
    moreInfo.find().forEach(docFreq =>{
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
}
//30ak sekundi