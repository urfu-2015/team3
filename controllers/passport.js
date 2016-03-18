const passport = require('../lib/passport');
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';
const collection = 'users';

exports.register = (req, res) => {
    res.render('register', req.commonData);
};

exports.login = (req, res) => {
    res.render('login', req.commonData);
};

exports.registerAction = (req, res, next) => {
    var user = {
        login: req.body.email,
        password: req.body.password
    };
    mLab.listDocuments({
        database: dbName,
        collectionName: collection,
        query: '{ "login": "' + user.login + '" }'
    }, (err, result) => {
        if (!err && !result.length) {
            passport.addUser(user, next);
            req.login(user, err => {
                if (err) {
                    next(err);
                } else {
                    res.redirect('/');
                }
                // err ? next(err) : res.redirect('/');
            });
        } else {
            next('this login exists');
        }
    });
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.loginAction = (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            next(err);
            return;
        }
        if (user) {
            req.logIn(user, err => {
                return err ? next(err) : res.redirect('/');
            });
        } else {
            res.redirect('/login');
        }
    })(req, res, next);
};
