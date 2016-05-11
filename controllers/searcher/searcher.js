'use strict';

const natural = require('natural');
var getList = require('./requestToMlab.js');

module.exports = {
    getAllTags: function (cb) {
        return getTags('tags', cb);
    },

    getSimilarTags: function (cb, query) {
        return getTags('tags', cb, query);
    },

    getQuests: function (cb, tag) {
        return getAllQuests('quests', cb, tag);
    },

    getCities: function (cb, city) {
        return getSimilarCities('quests', cb, city);
    }
};

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

function getSimilarCities(name, callback, city) {
    var cb = function (quests) {
        var cities = quests.map(function (quest) {
            return quest.cityName;
        });
        if (city) {
            cities = cities.filter(function (cityName, index) {
                return cities.indexOf(cityName) === index && isMatch(cityName, city);
            });
        }
        callback(cities);
    };
    return getList(name, cb);
}

function isMatch(city, data) {
    if (city.length < data.length) {
        return false;
    } else {
        var part = city.substring(0, data.length).toLowerCase();
        return part === data;
    }
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
