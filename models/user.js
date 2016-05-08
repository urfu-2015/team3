'use strict';

const dbName = 'kafkatist';
const collection = 'users';
// const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')('jCBpzUukLGFLZwoR2Uzs2ZcGpFMXYjQD');
const bcrypt = require('bcrypt-nodejs');

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
            'markers'
        ];
    }

    static getCurrentSessionUser(user) {
        var query = JSON.stringify({_id: {$oid: user}});
        return this.findUser(query);
    }

    static findUser(query) {
        var warningMessage = 'Такой пользователь не найден';
        var callback = (resolve, reject, result, response) => {
            if (!result.length) {
                response.message = warningMessage;
                resolve(response);
            }
            response.user = result[0];
            resolve(response);
        };
        return getRequest(query, warningMessage, callback);
    }

    static addUser(user) {
        var query = {login: user.login};
        var warningMessage = 'Такой логин уже существует';
        var callback = (resolve, reject, result, response) => {
            if (result.length) {
                response.message = warningMessage;
                resolve(response);
            } else {
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);
                mLab.insertDocuments({
                    database: dbName,
                    collectionName: collection,
                    documents: user
                }, (err, insertResult) => {
                    response.user = insertResult;
                    err ? reject(err) : resolve(response);
                });
            }
        };
        return getRequest(JSON.stringify(query), warningMessage, callback);
    }

    static addSocialUser(user) {
        return insertRequest(user);
    }

    static checkPassword(login, password) {
        var query = {login: login};
        var warningMessage = 'Такой пользователь не найден';
        var callback = (resolve, reject, result, response) => {
            if (!result.length) {
                response.message = warningMessage;
                resolve(response);
            }
            response.user = result[0];
            var isCorrect = bcrypt.compareSync(password, response.user.password);
            if (isCorrect) {
                resolve(response);
            } else {
                response.message = 'Пароль введён неверно';
                resolve(response);
            }
        };
        return getRequest(JSON.stringify(query), warningMessage, callback);
    }

    static checkToken(query) {
        var warningMessage = 'Токен сброса пароля неактивен. Попробуйте сбросить пароль ещё раз.';
        var callback = (resolve, reject, result, response) => {
            if (!result.length) {
                response.message = warningMessage;
                resolve(response);
            }
            response.user = result[0];
            resolve(response);
        };
        return getRequest(query, warningMessage, callback);
    }

    static updateUserInfo(updatedUser) {
        return updateRequest(updatedUser);
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

    static deleteUser(login, callback) {
        var options = {
            database: dbName,
            collectionName: 'users',
            query: JSON.stringify({login: login})
        };
        mLab.deleteDocuments(options, (err, result) => {
            callback(err, result);
        });
    }

    save(callback) {
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

function getRequest(query, warningMessage, colName, callback) {
    var collectName = colName;
    if (arguments.length === 3) {
        callback = arguments[2];
        collectName = collection;
    }
    var response = {message: '', user: {}};
    return new Promise((resolve, reject) => {
        mLab.listDocuments({
            database: dbName,
            collectionName: collectName,
            query: query
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            callback(resolve, reject, result, response);
        });
    });
}

function updateRequest(updatedUser) {
    return new Promise((resolve, reject) => {
        var id = updatedUser._id.$oid;
        mLab.updateDocument({
            database: dbName,
            collectionName: collection,
            id: id,
            updateObject: updatedUser
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function insertRequest(user) {
    var response = {message: '', user: {}};
    return new Promise((resolve, reject) => {
        mLab.insertDocuments({
            database: dbName,
            collectionName: collection,
            documents: user
        }, (err, result) => {
            response.user = result;
            err ? reject(err) : resolve(response);
        });
    });
}
