'use strict';

const assert = require('assert');
const sinon = require('sinon');
const mockery = require('mockery');

const tags = [
    {slug: 'graffitiEkb', name: 'Graffiti Ekb'},
    {slug: 'graffiti', name: 'Graffiti'},
    {slug: 'граффити', name: 'Граффити'},
    {slug: 'граффит', name: 'Граффит'},
    {slug: 'catsEkb', name: 'Cats Ekb'},
    {slug: 'cats', name: 'Cats'}
];
const quests = [
    {
        displayName: 'Граффити',
        cityName: 'Екатеринбург',
        tags: [
            {slug: 'graffitiEkb', name: 'Graffiti Ekb'},
            {slug: 'graffiti', name: 'Graffiti'},
            {slug: 'граффити', name: 'Граффити'},
            {slug: 'граффит', name: 'Граффит'}
        ]
    },
    {
        displayName: 'Котики',
        cityName: 'Кошкибург',
        tags: [
            {slug: 'catsEkb', name: 'Cats Ekb'},
            {slug: 'cats', name: 'Cats'}
        ]
    }
];

var searcher;
describe('Searcher', function () {
    before(function () {
        function getListMock(name, cb) {
            return new Promise(function (resolve, reject) {
                if (name === 'tags') {
                    cb(tags);
                    resolve();
                } else if (name === 'quests') {
                    cb(quests);
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
                    assert.equal(result.length, 6);
                    assert.equal(result[0], 'Graffiti Ekb');
                    assert.equal(result[1], 'Graffiti');
                    assert.equal(result[2], 'Граффити');
                    assert.equal(result[3], 'Граффит');
                    assert.equal(result[4], 'Cats Ekb');
                    assert.equal(result[5], 'Cats');
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

        it('should return all cities which contain the search city', function (done) {
            var spy = sinon.spy();
            searcher
                .getCities(spy, 'бург')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 2);
                    assert.equal(result[0], 'Екатеринбург');
                    assert.equal(result[1], 'Кошкибург');
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
