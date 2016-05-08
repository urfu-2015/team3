'use strict';

// const apiKey = require('../../apiKey').apiKey;
const apiKey = require('./apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';
const collection = 'users';

module.exports = {
    getPanorama: function (city) {
        var callback = (resolve, reject, result) => {
            var panorama = [];
            panorama = result.filter(pan => {
                return pan.city === city;
            });
            var def = 'http://res.cloudinary.com/kafkatist/image/upload/v1461940417/1_ygtotf.jpg';
            panorama.length ? resolve(panorama[0].url) : resolve(def);
        };
        return getRequest(JSON.stringify({}), '', 'panorams', callback);
    }
};

function getRequest(query, warningMessage, colName, callback) {
    var collectName = colName;
    if (arguments.length === 3) {
        callback = arguments[2];
        collectName = collection;
    }
    var response = {message: '', user: {}};
    return new Promise((resolve, reject) => {
        mLab.listDocuments({
            database: dbName,
            collectionName: collectName,
            query: query
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            callback(resolve, reject, result, response);
        });
    });
}
