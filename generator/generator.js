'use strict';

const mongoClient = require('mongodb').MongoClient;
const data = require('./data/data.json');
const url = 'mongodb://localhost:27017/kafkatist';

mongoClient.connect(url)
    .then(db => {
        const collections = Object.keys(data);
        const inserts = collections.map(item => {
            let col = db.collection(item);
            return col.removeMany({})
                .then(() => {
                    return col.insertMany(data[item]);
                })
                .then(() => {
                    return col.find({}).toArray();
                })
                .then(result => {
                    console.log(result);
                });
        });
        Promise.all(inserts)
            .catch(err => {
                console.error(err);
            })
            .then(() => {
                return db.close();
            })
            .then(() => {
                console.log('success!');
            });
    });
