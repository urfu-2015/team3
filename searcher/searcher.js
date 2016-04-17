'use strict'

const mongoClient = require('mongodb').MongoClient;
const natural = require('natural');
var url = 'mongodb://localhost:27017/kafkatist';

module.exports = {
    getAllTags: function (cb, localUrl) {
        setUrl(localUrl);
        return getTags('tags', cb);
    },

    getSimilarTags: function (cb, query, localUrl) {
        setUrl(localUrl);
        return getTags('tags', cb, query);
    },

    getQuests: function (cb, localUrl, tag) {
        setUrl(localUrl);
        return getAllQuests('quests', cb, tag);
    }
};

function setUrl(localUrl) {
    if (localUrl) {
        url = localUrl;
    }
}

/* eslint new-cap: ["error", {"capIsNewExceptions": ["natural.JaroWinklerDistance"]}]*/
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
                return quest.tags.some(function (elem) {
                    return elem.name.indexOf(tag) !== -1;
                });
            });
        }
        mainCb(quests);
    };
    return getList(name, cb);
}

function getList(name, cb) {
    return mongoClient
        .connect(url)
        .then(function (db) {
            return new Promise(function (resolve, reject) {
                var collection = db.collection(name);
                collection.find({}).toArray(function (error, objects) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        cb(objects);
                        resolve();
                    }
                    db.close();
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}
