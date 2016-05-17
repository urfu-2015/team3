'use strict';

const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
const hbs = require('hbs');
const flash = require('connect-flash');
const morgan = require('morgan');
var argv = require('minimist')(process.argv.slice(2));
const bodyParser = require('body-parser');

const publicDir = path.join(__dirname, 'public');

require('./lib/auth/passport')(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use(morgan('dev'));
app.use(require('cookie-parser')());

app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('compression')());

app.use(require('express-session')({
    secret: 'kafkatist',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(publicDir, {
    maxAge: 1000 * 60 * 60 * 24 * 30
}));
app.use(flash());

app.set('port', (process.env.PORT || 5000));

app.use((err, req, res, next) => {
    console.error(err);
    next();
});

app.use((req, res, next) => {
    req.commonData = {
        isDev: argv.NODE_ENV === 'development',
        title: 'PhotoQuest',
        meta: {
            description: 'PhotoQuest by Kafkatist',
            charset: 'utf-8'
        }
    };
    next();
});

require('./routes')(app, passport);

app.listen(app.get('port'),
    () => console.log(`Listening on port ${app.get('port')}`));

module.exports = app;
