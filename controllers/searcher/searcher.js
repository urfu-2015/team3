'use strict';

const natural = require('natural');
var getList = require('./requestToMlab.js');

module.exports = {
    getAllTags: function (cb) {
        return getTags('quests', cb);
    },

    getSimilarTags: function (cb, query) {
        return getTags('quests', cb, query);
    },

    getQuests: function (cb, tag) {
        return getAllQuests('quests', cb, tag);
    },

    getCities: function (cb, city) {
        return getSimilarCities('quests', cb, city);
    }
};

/* eslint new-cap: ["error", {"capIsNewExceptions": ["natural.JaroWinklerDistance"]}]*/
function getTags(name, callback, tag) {
    var cb = function (quests) {
        var tagsList = [];
        for (var i = 0; i < quests.length; i++) {
            tagsList = tagsList.concat(quests[i].tags);
        }
        if (tag) {
            tagsList = tagsList.filter(function (elem) {
                return natural.JaroWinklerDistance(tag, elem) > 0.7;
            });
        }
        callback(tagsList);
    };
    var options = {};
    if (tag) {
        var reg = '^' + encodeURIComponent(tag);
        var query = JSON.stringify({tags: {$regex: reg, $options: 'i'}});
        options.query = query;
        options.setOfFields = JSON.stringify({tags: 1});
        return getList(name, cb, options);
    }
    return getList(name, cb);
}

function getSimilarCities(name, callback, city) {
    var cb = function (quests) {
        var cities = quests.map(function (quest) {
            return quest.cityName;
        });
        callback(cities);
    };
    if (city) {
        var options = {};
        var reg = '^' + encodeURIComponent(city);
        var query = JSON.stringify({cityName: {$regex: reg, $options: 'i'}});
        options.query = query;
        options.setOfFields = JSON.stringify({cityName: 1});
        return getList(name, cb, options);
    }
    return getList(name, cb);
}

function getAllQuests(name, mainCb, tag) {
    var cb = function (quests) {
        quests = quests.sort(function (quest1, quest2) {
            if (quest2.rating.likes && quest1.rating.likes) {
                return quest2.rating.likes.length - quest1.rating.likes.length;
            }
            return 0;
        });
        mainCb(quests);
    };
    var options = {};
    if (tag && tag !== 'default') {
        var reg = '^' + encodeURIComponent(tag);
        var query = JSON.stringify({tags: {$regex: reg, $options: 'i'}});
        options.query = query;
        return getList(name, cb, options);
    }
    return getList(name, cb);
}
