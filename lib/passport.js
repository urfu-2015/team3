const passport = require('passport');
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';
const collection = 'users';
const bcrypt = require('bcrypt-nodejs');

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        mLab.listDocuments({
            database: dbName,
            collectionName: collection,
            query: '{ "login": "' + username + '" }'
        }, (err, result) => {
            if (err) {
                done(null, result);
            }
            if (result.length) {
                var isCorrect = bcrypt.compareSync(password, result[0].password);
                isCorrect ?
                    done(null, result[0]) :
                    done(null, false, {message: 'Incorrect password'});
            } else {
                done(null, false, {message: 'Incorrect login'});
            }
        });
    }
));

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((login, cb) => {
    mLab.listDocuments({
        database: dbName,
        collectionName: collection,
        query: '{ "login": "' + login + '" }'
    }, (err, result) => {
        if (result.length && !err) {
            cb(null, result[0]._id);
        }
    });
});

var addUser = (user, next) => {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);
    mLab.insertDocuments({
        database: dbName,
        collectionName: collection,
        documents: user
    }, (err, result) => {
        err ? next(err) : next(result);
    });
};

passport.registerUser = (user, next) => {
    return new Promise((resolve, reject) => {
        mLab.listDocuments({
            database: dbName,
            collectionName: collection,
            query: '{ "login": "' + user.login + '" }'
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            if (!err && !result.length) {
                addUser(user, next);
                resolve(result);
            } else {
                reject('this login exists');
            }
        });
    });
};

module.exports = passport;
