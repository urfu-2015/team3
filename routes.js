'use strict';

const pages = require('./controllers/pages');
const passport = require('./controllers/passport');

module.exports = function (app) {
    app.get('/', pages.index);
    app.get('/login', passport.login);
    app.post('/login', passport.loginAction);
    app.get('/logout', passport.logout);
    app.get('/register', passport.register);
    app.post('/register', passport.registerAction);
    app.all('*', pages.error404);
    app.use((err, req, res) => {
        console.error(err);
        res.sendStatus(500);
    });
};
