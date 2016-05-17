'use strict';

const dbName = 'kafkatist';
const collection = 'users';
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const bcrypt = require('bcrypt-nodejs');

class User {
    constructor(user) {
        this.user = user;
        this.fields = [
            'login',
            'password',
            'activeQuests', // квесты, которые сейчас проходятся {slug1: [3, 1], slug2: [0, 2]}
            'passedQuests', // пройденные квесты
            'myQuests', // созданные квесты
            'wishList', // квесты которые я хочу пройти
            'isBanned',
            'photos', // мои фотографии, котороые подошли к квестам
            'nickname',
            'avatar',
            'city',
            'markers',
            'gender'
        ];
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

    saveSocialUser() {
        return insertRequest(getUserObj(this));
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

    static getUsers(query) {
        return new Promise((resolve, reject) => {
            var options = {
                database: dbName,
                collectionName: 'users',
                query: JSON.stringify(query)
            };
            mLab.listDocuments(options, (err, result) => {
                err ? reject(err) : resolve(result);
            });
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

    save() {
        var user = getUserObj(this);
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
        return getRequest(JSON.stringify({login: user.login}), warningMessage, callback);
    }
}

module.exports = User;

function getUserObj(obj) {
    var login = obj.user.login;
    var password = obj.user.password;
    var nickname = obj.user.nickname || '';
    var activeQuests = obj.user.activeQuests || {};
    var passedQuests = obj.user.passedQuests || [];
    var myQuests = obj.user.myQuests || [];
    var wishList = obj.user.wishList || [];
    var isBanned = obj.user.isBanned || false;
    var photos = obj.user.photos || [];
    var markers = obj.user.markers || [];
    var avatar = 'http://res.cloudinary.com/kafkatist/image/upload/v1463238108/noavatar_eb8qq6.png';
    if (obj.user.gender) {
        avatar = obj.user.gender === 'female' ?
            'http://res.cloudinary.com/kafkatist/image/upload/v1463231123/girl_gkuapr.jpg' :
            'http://res.cloudinary.com/kafkatist/image/upload/v1463237541/boy_jscjr6.png';
    }
    var city = obj.user.city || '';
    var gender = obj.user.gender || '';
    return {
        login,
        password,
        nickname,
        activeQuests,
        passedQuests,
        myQuests,
        wishList,
        isBanned,
        photos,
        avatar,
        markers,
        city,
        gender
    };
}

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
