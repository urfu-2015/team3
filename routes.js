'use strict';

const pages = require('./controllers/pages');
const auth = require('./controllers/auth');

module.exports = function (app, passport) {
    app.get('/', pages.index);

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/login', (req, res) => {
        res.render('login', {message: req.flash('loginMessage')});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', (req, res) => {
        res.render('signup', {message: req.flash('signupMessage')});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/forgot', (req, res) => {
        res.render('forgot', req.flash('resetPasswordMessage'));
    });

    app.post('/forgot', auth.forgot);

    app.get('/reset/:token', auth.reset);

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

    app.get('/createquest', pages.createquest);

    app.all('*', pages.error404);

    app.use((err, req, res) => {
        console.error(err);
        res.sendStatus(500);
    });
};

// будет использоваться, когда появится страница профиля
/* function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}*/
