'use strict'

const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/kafkatist';
const natural = require('natural');

module.exports = {
    getAllTags: function () {
        return getTags('tags');
    },

    getSimilarTags: function (query) {
        return getTags('tags', query);
    },

    getQuests: function (tag) {
        return getAllQuests('quests', tag);
    }
};

function getTags(name, query) {
    var cb = function (tags) {
        var tagsList = [];
        for (var i = 0; i < tags.length; i++) {
            tagsList.push(tags[i].name);
        }
        if (query) {
            tagsList = tagsList.filter(function (elem) {
                return natural.JaroWinklerDistance(query, elem) > 0.8;
            });
        }
        console.log(tagsList);
    };
    getList(name, cb);
}

function getAllQuests(name, tag) {
    var cb = function (quests) {
        if (tag) {
            quests = quests.filter(function (quest) {
                return quest['tags'].some(function (elem) {
                    return elem['name'].indexOf(tag) !== -1;
                });
            });
        }
        console.log(quests);
    }
    getList(name, cb);
}

function getList(name, cb) {
    mongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
        } else {
            var collection = db.collection(name);
            collection.find({}).toArray(function (error, objects) {
                if (error) {
                    console.log(error);
                } else {
                    cb(objects);
                }
                db.close();
            });
        }
    });
}
