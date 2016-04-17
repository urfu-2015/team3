'use strict';

const searcher = require('../../searcher/searcher.js');
const assert = require('assert');
const url = 'mongodb://<dbuser>:<dbpassword>@ds064718.mlab.com:64718/kafkatist';
const sinon = require('sinon');
const mongoClient = require('mongodb').MongoClient;
const tags = [
    {slug: 'graffitiEkb', name: 'Graffiti Ekb'},
    {slug: 'graffiti', name: 'Graffiti'},
    {slug: 'граффити', name: 'Граффити'},
    {slug: 'граффит', name: 'Граффит'}
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
        cityName: 'Екатеринбург',
        tags: [
            {slug: 'catsEkb', name: 'Cats Ekb'},
            {slug: 'cats', name: 'Cats'}
        ]
    }
];
var connect;

describe('Searcher', function () {
    before(function (done) {
        mongoClient.connect(url)
            .then(function (db) {
                connect = db;
            })
            .then(done, done);
    });

    describe('Get tags', function () {
        beforeEach(function (done) {
            var collection = connect.collection('tags');
            collection.remove({});
            collection.insertMany(tags, () => done());
        });

        it('should get all tags', function (done) {
            var spy = sinon.spy();
            searcher
                .getAllTags(spy, url)
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(spy.args[0][0].length, 4);
                    assert.equal(result[0], 'Graffiti Ekb');
                    assert.equal(result[2], 'Граффити');
                })
                .then(done, done);
        });

        it('should get similar tags', function (done) {
            var spy = sinon.spy();
            searcher
                .getSimilarTags(spy, 'граффити', url)
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(spy.args[0][0].length, 2);
                    assert.equal(result[0], 'Граффити');
                    assert.equal(result[1], 'Граффит');
                })
                .then(done, done);
        });
    });

    describe('Get quests', function () {
        beforeEach(function (done) {
            var collection = connect.collection('quests');
            collection.remove({});
            collection.insertMany(quests, () => done());
        });

        it('should get all quests', function (done) {
            var spy = sinon.spy();
            searcher
                .getQuests(spy, url)
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 2);
                    assert.equal(result[0].displayName, 'Граффити');
                    assert.equal(result[1].displayName, 'Котики');
                })
                .then(done, done);
        });

        it('should get quest on tag', function (done) {
            var spy = sinon.spy();
            searcher
                .getQuests(spy, url, 'Граффити')
                .then(function () {
                    var result = spy.args[0][0];
                    assert.equal(result.length, 1);
                    assert.equal(result[0].displayName, 'Граффити');
                })
                .then(done, done);
        });
    });

    after(function () {
        return connect.close();
    });
});
