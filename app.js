'use strict';

const express = require('express');
const app = express();

const morgan = require('morgan');

app.use(morgan('dev'));

app.set('port', (process.env.PORT || 5000));

app.use((err, req, res, next) => {
    console.error(err);
    next();
});

app.use((req, res, next) => {
    req.commonData = {
        isDev: process.env.NODE_ENV === 'development'
    };
    next();
});

require('./routes')(app);


app.listen(app.get('port'),
    () => console.log(`Listening on port ${app.get('port')}`));

module.exports = app;
