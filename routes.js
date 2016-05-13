'use strict';

const pages = require('./controllers/pages');
const auth = require('./controllers/auth');
const quest = require('./controllers/quest');
const profile = require('./controllers/profile');

module.exports = function (app, passport) {
    app.get('/', setLoggedFlag, pages.index);

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/login', isLoggedIn, setLoggedFlag, (req, res) => {
        var data = Object.assign({message: req.flash('loginMessage')}, req.commonData);
        res.render('auth/login', data);
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', isLoggedIn, setLoggedFlag, (req, res) => {
        var data = Object.assign({message: req.flash('signupMessage')}, req.commonData);
        res.render('auth/signup', data);
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/forgot', isLoggedIn, setLoggedFlag, (req, res) => {
        res.render('auth/forgot', req.commonData);
    });

    app.post('/forgot', auth.forgot);

    app.get('/reset/:token', isLoggedIn, setLoggedFlag, auth.reset);

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

    app.post('/addQuest', quest.loadPhoto, quest.createQuest, quest.questPage);

    app.get('/quest/:slug', setLoggedFlag, quest.getQuest);

    app.get('/profile/:id', profile.getProfile);

    app.get('/editProfile', profile.editProfile);

    app.post('/editProfile', profile.updateProfile);

    app.post('/addToWishList', quest.addToWishList);

    app.put('/addPhotoComment', quest.addPhotoComment);

    app.put('/addQuestComment', quest.addQuestComment);

    app.all('*', pages.error404);

    app.use((err, req, res) => {
        console.error(err);
        res.sendStatus(500);
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    next();
}

function setLoggedFlag(req, res, next) {
    if (!req.isAuthenticated()) {
        var data = {isNotLogged: true};
        req.commonData = Object.assign(data, req.commonData);
    }
    next();
}

