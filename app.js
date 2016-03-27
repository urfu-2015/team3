'use strict';

const express = require('express');
const app = express();
const path = require('path');
const passport = require('./lib/passport');
const hbs = require('hbs');

const morgan = require('morgan');
const publicDir = path.join(__dirname, 'public');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('dev'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({
    secret: 'kafkatist',
    resave: false,
    saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(publicDir));

app.set('port', (process.env.PORT || 5000));

app.use((err, req, res, next) => {
    console.error(err);
    next();
});

app.use((req, res, next) => {
    req.commonData = {
        isDev: process.env.NODE_ENV === 'development',
        title: 'PhotoQuest',
        meta: {
            description: 'PhotoQuest by Kafkatist',
            charset: 'utf-8'
        }
    };
    next();
});

require('./routes')(app);

hbs.registerPartials(path.join(__dirname, 'blocks'));

app.listen(app.get('port'),
    () => console.log(`Listening on port ${app.get('port')}`));

module.exports = app;