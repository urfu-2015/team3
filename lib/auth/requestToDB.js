'use strict';

const apiKey = require('../../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';

module.exports = {
    getPanorama: function (city) {
        var options = {
            database: dbName,
            collectionName: 'panorams',
            query: JSON.stringify({})
        };
        var callback = (resolve, reject, result) => {
            var panorama = [];
            panorama = result.filter(pan => {
                return pan.city === city;
            });
            var def = 'http://res.cloudinary.com/kafkatist/image/upload/v1461940417/1_ygtotf.jpg';
            panorama.length ? resolve(panorama[0].url) : resolve(def);
        };
        return getRequest(options, '', callback);
    }
};

function getRequest(options, warningMessage, callback) {
    var response = {message: '', user: {}};
    return new Promise((resolve, reject) => {
        mLab.listDocuments(options, (err, result) => {
            if (err) {
                reject(err);
            }
            callback(resolve, reject, result, response);
        });
    });
}
