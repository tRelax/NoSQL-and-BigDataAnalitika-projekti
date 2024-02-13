use('test')

db.train.createIndex({number_of_elements: 1, mean_Valence:1, range_Valence: 1, critical_temp: 1});
db.train.find({number_of_elements: 5, mean_Valence: 2, range_Valence: 2, critical_temp: 26}).forEach((doc) =>{
    console.log(doc)
});
