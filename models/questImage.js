'use strict';
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';
const cloudinary = require('../lib/cloudinary-images/cloudinary-loader');

class questImage {
    constructor(title, url, geolocation) {
        this.title = title;
        this.url = url;
        this.geolocation = geolocation;
    }
    save() {
        var title = this.title;
        var url = this.url;
        var geolocation = this.geolocation;
        cloudinary.uploadImage(url, title, imageURL => {
            var options = {
                database: dbName,
                collectionName: 'questImages',
                documents: {
                    title,
                    imageURL,
                    geolocation
                }
            };
            mLab.insertDocuments(options, (err, result) => {
                err ?
                    console.error('There is an error! ' + err) :
                    console.log('Success' + result);
            });
        });
    }
}
module.exports = questImage;
