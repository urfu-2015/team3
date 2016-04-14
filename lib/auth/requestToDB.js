'use strict';

const bcrypt = require('bcrypt-nodejs');
const apiKey = require('./apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';
const collection = 'users';

module.exports = {
    findUser: function (query) {
        var warningMessage = 'User is not found';
        var callback = (resolve, reject, result, response) => {
            if (!result.length) {
                response.message = warningMessage;
                resolve(response);
            }
            response.user = result[0];
            resolve(response);
        };
        return getRequest(query, warningMessage, callback);
    },
    addUser: function (user) {
        var query = {login: user.login};
        var warningMessage = 'This login already exists';
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
    },
    addSocialUser: function (user) {
        return insertRequest(user);
    },
    checkPassword: function (login, password) {
        var query = {login: login};
        var warningMessage = 'User is not found';
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
                response.message = 'The password is not correct';
                resolve(response);
            }
        };
        return getRequest(JSON.stringify(query), warningMessage, callback);
    },
    checkToken: function (query) {
        var warningMessage = 'Password reset token is invalid or has expired';
        var callback = (resolve, reject, result, response) => {
            if (!result.length) {
                response.message = warningMessage;
                resolve(response);
            }
            response.user = result[0];
            resolve(response);
        };
        return getRequest(query, warningMessage, callback);
    },
    updateUserInfo: function (updatedUser) {
        return updateRequest(updatedUser);
    }
};

function getRequest(query, warningMessage, callback) {
    var response = {message: '', user: {}};
    return new Promise((resolve, reject) => {
        mLab.listDocuments({
            database: dbName,
            collectionName: collection,
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
