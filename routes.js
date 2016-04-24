'use strict';

const pages = require('./controllers/pages');
const auth = require('./controllers/auth');
const questslist = require('./controllers/questslist');

module.exports = function (app, passport) {
    app.get('/', isLoggedIn, pages.index);

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/login', isLoggedIn, (req, res) => {
        var data = Object.assign({message: req.flash('loginMessage')}, req.commonData);
        res.render('auth/login', data);
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', isLoggedIn, (req, res) => {
        var data = Object.assign({message: req.flash('signupMessage')}, req.commonData);
        res.render('auth/signup', data);
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/forgot', isLoggedIn, (req, res) => {
        res.render('auth/forgot', req.commonData);
    });

    app.post('/forgot', auth.forgot);

    app.get('/reset/:token', isLoggedIn, auth.reset);

    app.post('/reset/:token', auth.resetAction);

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/auth/vkontakte', passport.authenticate('vkontakte'));

    app.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/auth/google', passport.authenticate('google', {scope: 'profile'}));

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/addQuest', quest.addQuest);

    app.all('*', pages.error404);

    app.use((err, req, res) => {
        console.error(err);
        res.sendStatus(500);
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        req.url === '/' ? next() : res.redirect('/');
    }
    var data = {isNotLogged: true};
    req.commonData = Object.assign(data, req.commonData);
    next();
}

/* function canOpenProfile(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}*/
