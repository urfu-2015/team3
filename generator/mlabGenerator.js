'use strict';

const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const data = require('./data/data.json');
const dbName = 'kafkatist';

removeCollections();
insertCollections();

function removeCollections() {
    Object.keys(data).forEach(collection => {
        var options = {
            database: dbName,
            collectionName: collection
        };
        mLab.deleteDocuments(options, (err, result) => {
            /* err ?
                console.error('There is an error! ' + err) :
                console.log('Removed ' + result.removed + ' records from ' + collection);*/
            if (err) {
                console.error('There is an error! ' + err);
            } else {
                console.log('Removed ' + result.removed + ' records from ' + collection);
            }
        });
    });
}

function insertCollections() {
    Object.keys(data).forEach(collection => {
        var options = {
            database: dbName,
            collectionName: collection,
            documents: data[collection]
        };
        mLab.insertDocuments(options, (err, result) => {
            if (err) {
                console.error('There is an error! ' + err);
            } else {
                console.log('Inserted ' + result.n + ' records to ' + collection);
            }
            /* err ?
                console.error('There is an error! ' + err) :
                console.log('Inserted ' + result.n + ' records to ' + collection);*/
        });
    });
}
