'use strict';

const assert = require('assert');
const sinon = require('sinon');
const mockery = require('mockery');

const quests = [
    {
        displayName: 'Граффити',
        cityName: 'Екатеринбург',
        tags: ['Graffiti', 'Граффити', 'Граффит'],
        rating: {likes: [], dislikes: []}
    },
    {
        displayName: 'Котики',
        cityName: 'Кошкибург',
        tags: ['Cats', 'Koshki'],
        rating: {likes: [], dislikes: []}
    }
];

var cityE = '^' + encodeURIComponent('ек');
var existCityQuery = JSON.stringify({cityName: {$regex: cityE, $options: 'i'}});

var cityO = '^' + encodeURIComponent('Оренбург');
var notExistCityQuery = JSON.stringify({cityName: {$regex: cityO, $options: 'i'}});

var tagGr = '^' + encodeURIComponent('графф');
var existTagQuery = JSON.stringify({tags: {$regex: tagGr, $options: 'i'}});

var tagGraffity = '^' + encodeURIComponent('Граффити');
var existFullTagQuery = JSON.stringify({tags: {$regex: tagGraffity, $options: 'i'}});

var tagA = '^' + encodeURIComponent('alphabet');
var notExistTagQuery = JSON.stringify({tags: {$regex: tagA, $options: 'i'}});

var searcher;
describe('Searcher', function () {
    before(function () {
        function getListMock(name, cb, opt) {
            return new Promise(function (resolve, reject) {
                if (!opt) {
                    cb(quests);
                    resolve();
                } else if (opt.query === existCityQuery ||
                           opt.query === existTagQuery ||
                           opt.query === existFullTagQuery) {
                    cb([quests[0]]);
                    resolve();
                } else if (opt.query === notExistCityQuery || opt.query === notExistTagQuery) {
                    cb([]);
                    resolve();
                } else {
                    reject();
                }
            });
        }
        mockery.registerMock('./requestToMlab.js', getListMock);
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
        searcher = require('../../controllers/searcher/searcher.js');
    });

    describe('Get tags', function () {
        it('should return all tags', function (done) {
            var spy = sinon.spy();
            searcher
                .getAllTags(spy)
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 5);
                    assert.equal(result[0], 'Graffiti');
                    assert.equal(result[1], 'Граффити');
                    assert.equal(result[2], 'Граффит');
                    assert.equal(result[3], 'Cats');
                    assert.equal(result[4], 'Koshki');
                })
                .then(done, done);
        });

        it('should return tags which are similar to the search tag', function (done) {
            var spy = sinon.spy();
            searcher
                .getSimilarTags(spy, 'графф')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 2);
                    assert.equal(result[0], 'Граффити');
                    assert.equal(result[1], 'Граффит');
                })
                .then(done, done);
        });

        it('should return empty list of tags if search tag is not existing', function (done) {
            var spy = sinon.spy();
            searcher
                .getSimilarTags(spy, 'alphabet')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 0);
                })
                .then(done, done);
        });
    });

    describe('Get quests', function () {
        it('should get all quests', function (done) {
            var spy = sinon.spy();
            searcher
                .getQuests(spy)
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 2);
                    assert.equal(result[0].displayName, 'Граффити');
                    assert.equal(result[1].displayName, 'Котики');
                })
                .then(done, done);
        });

        it('should return quests which contain the search tag', function (done) {
            var spy = sinon.spy();
            searcher
                .getQuests(spy, 'Граффити')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 1);
                    assert.equal(result[0].displayName, 'Граффити');
                })
                .then(done, done);
        });

        it('should return empty list of quests if search tag is not existing', function (done) {
            var spy = sinon.spy();
            searcher
                .getQuests(spy, 'alphabet')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 0);
                })
                .then(done, done);
        });
    });

    describe('Get cities', function () {
        it('should return all cities listed in the quests', function (done) {
            var spy = sinon.spy();
            searcher
                .getCities(spy)
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 2);
                })
                .then(done, done);
        });

        it('should return all cities which start with the search query', function (done) {
            var spy = sinon.spy();
            searcher
                .getCities(spy, 'ек')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 1);
                    assert.equal(result[0], 'Екатеринбург');
                })
                .then(done, done);
        });

        it('should return empty list of cities if search city is not existing', function (done) {
            var spy = sinon.spy();
            searcher
                .getQuests(spy, 'Оренбург')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 0);
                })
                .then(done, done);
        });
    });

    after(function () {
        mockery.disable();
    });
});
