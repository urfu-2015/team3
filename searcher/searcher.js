'use strict'

const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/kafkatist';
const natural = require('natural');

module.exports = {
    getAllTags: function (cb) {
        return getTags('tags', cb);
    },

    getSimilarTags: function (cb, query) {
        return getTags('tags', cb, query);
    },

    getQuests: function (cb, tag) {
        return getAllQuests('quests', cb, tag);
    }
};

function getTags(name, callback, query) {
    var cb = function (tags) {
        var tagsList = [];
        for (var i = 0; i < tags.length; i++) {
            tagsList.push(tags[i].name);
        }
        if (query) {
            tagsList = tagsList.filter(function (elem) {
                return natural.JaroWinklerDistance(query, elem) > 0.7;
            });
        }
        callback(tagsList);
    };
    return getList(name, cb);
}

function getAllQuests(name, mainCb, tag) {
    var cb = function (quests) {
        if (tag) {
            quests = quests.filter(function (quest) {
                return quest['tags'].some(function (elem) {
                    return elem['name'].indexOf(tag) !== -1;
                });
            });
        }
        mainCb(quests);
    }
    return getList(name, cb);
}

function getList(name, cb) {
    return mongoClient
        .connect(url)
        .then(function (db) {
            var collection = db.collection(name);
            return collection.find({}).toArray(function (error, objects) {
                if (error) {
                    console.log(error);
                } else {
                    cb(objects);
                }
                db.close();
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}
