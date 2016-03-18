const passport = require('passport');
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';
const collection = 'users';

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
                /* result[0].password === password ?
                    done(null, result[0]) :
                    done(null, false, {message: 'Incorrect password'});*/
                if (result[0].password === password) {
                    done(null, result[0]);
                } else {
                    done(null, false, {message: 'Incorrect password'});
                }
            } else {
                done(null, false, {message: 'Incorrect login'});
            }
        });
    }
));

passport.serializeUser((user, cb) => {
    cb(null, user.login);
});

passport.deserializeUser((login, cb) => {
    mLab.listDocuments({
        database: dbName,
        collectionName: collection,
        query: '{ "login": "' + login + '" }'
    }, (err, result) => {
        if (result.length && !err) {
            cb(null, result[0]);
        }
    });
});

passport.addUser = (user, next) => {
    mLab.insertDocuments({
        database: dbName,
        collectionName: collection,
        documents: user
    }, (err, result) => {
        if (err) {
            next(err);
        } else {
            next(result);
        }
    });
};

module.exports = passport;
