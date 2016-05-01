'use strict';

const dbName = 'kafkatist';
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);

class User {
    constructor(user) {
        this.user = user;
        this.fields = [
            'login',
            'password',
            'passedQuests',
            'myQuests',
            'wishList',
            'isBanned',
            'photos',
            'nickname',
            'avatar',
            'gender',
        ];
    }

    static getUsers(query, callback) {
        var options = {
            database: dbName,
            collectionName: 'users',
            query: JSON.stringify(query)
        };
        mLab.listDocuments(options, (err, result) => {
            callback(err, result);
        });
    }

    static deleteUser(query, callback) {
        var options = {
            database: dbName,
            collectionName: 'users',
            query: JSON.stringify(query)
        };
        mLab.deleteDocuments(options, (err, result) => {
            callback(err, result);
        });
    }

    static updateUsers(data, query, callback) {
        // проверяем что не хотят добавить лишнее поле
        for (var key in data) {
            if (this.fields.indexOf(key) === -1) {
                callback(true, []);
            }
        }
        var options = {
            database: dbName,
            collectionName: 'users',
            data: data,
            query: JSON.stringify(query)
        };
        
        mLab.updateDocuments(options, (err, result) => {
            callback(err, result);
        });
    }

    save(callback) {
        // проверим что не передали лишних полей
        for (var key in this.questObject) {
            if (this.fields.indexOf(key) === -1) {
                return callback(true, "field '" + key + "' not in fields", []);
            }
        }

        var login = this.user.login;
        var password = this.user.password;
        var nickname = this.user.nickname || '';
        var passedQuests = this.user.passedQuests || [];
        var myQuests = this.user.myQuests || [];
        var wishList = this.user.wishList || [];
        var isBanned = this.user.isBanned || false;
        var photos = this.user.photos || [];
        var avatar = this.user.avatar || '';
        var gender = this.user.gender || '';
        var options = {
            database: dbName,
            collectionName: 'users',
            documents: {
                login,
                password,
                nickname,
                passedQuests,
                myQuests,
                wishList,
                isBanned,
                photos,
                avatar,
                gender
            }
        };
        mLab.insertDocuments(options, (err, result) => {
            callback(err, "", result);
        });
    }
}

module.exports = User;
