'use strict';

const apiKey = require('../../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';

module.exports = function (name, cb, opt) {
    var options = {
        database: dbName,
        collectionName: name
    };
    if (opt) {
        options = Object.assign(options, opt);
    }
    return new Promise(function (resolve, reject) {
        mLab.listDocuments(options, function (error, objects) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                cb(objects);
                resolve();
            }
        });
    });
};
