'use strict';

const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const requestToDB = require('../lib/auth/requestToDB');
const nodemailer = require('nodemailer');
const config = require('../lib/auth/config');

exports.forgot = (req, res, next) => {
    async.waterfall([
        done => {
            crypto.randomBytes(20, (err, buf) => {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            var query = {login: req.body.login};
            requestToDB
                .findUser(JSON.stringify(query))
                .then(response => {
                    if (response.message.length) {
                        var data = {message: response.message};
                        return res.render('forgot', Object.assign(data, req.commonData));
                    }
                    done(null, response.user, token);
                })
                .catch(err => {
                    console.error(err);
                    done(err, null, token);
                });
        },
        (user, token, done) => {
            var updatedUser = user;
            updatedUser.resetPasswordToken = token;
            updatedUser.resetPasswordExpires = Date.now() + 3600000;
            requestToDB
                .updateUserInfo(updatedUser)
                .then(updatedUser => {
                    done(null, updatedUser.login, token);
                })
                .catch(err => {
                    console.error(err);
                    done(err, null, token);
                });
        },
        (login, token, done) => {
            var transporter = nodemailer.createTransport({
                service: 'Yandex',
                auth: {
                    user: config.emailLogin.email,
                    pass: config.emailLogin.password
                }
            });
            var link = 'http://' + req.headers.host + '/reset/' + token;
            var mailOptions = {
                from: `PhotoQuestTeam3 <${config.emailLogin.email}>`,
                to: login,
                subject: 'PhotoQuest - Reset Password',
                generateTextFromHTML: true,
                html: '<b>Reset password</b><br/>' +
                    'If you still want to reset the password of you account, please click on ' +
                    '<a href=\"' + link.toString() + '\">following link</a>' +
                    ' to complete the process.<br/>' +
                    'But if you did not request this, please ignore this email. ' +
                    'Have a nice day! :)'
            };
            transporter.sendMail(mailOptions, err => {
                var data = {
                    message: 'An e-mail has been sent to ' + login + ' with further instructions.'
                };
                res.render('forgot', Object.assign(data, req.commonData));
                done(err);
            });
        }
    ], err => {
        if (err) {
            return next(err);
        }
    });
};

exports.reset = (req, res, next) => {
    var query = {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    };
    requestToDB
        .checkToken(JSON.stringify(query))
        .then(response => {
            if (response.message.length) {
                req.flash('error', response.message);
                res.redirect('/forgot');
            } else {
                res.render('reset');
            }
        })
        .catch(err => {
            console.error(err);
            next(err);
        });
};

exports.resetAction = (req, res, next) => {
    async.waterfall([
        done => {
            if (req.body.confPassword !== req.body.password) {
                var data = {message: 'The passwords do not match'};
                return res.render('reset', Object.assign(data, req.commonData));
            }
            done(null);
        },
        done => {
            var query = {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {$gt: Date.now()}
            };
            requestToDB
                .checkToken(JSON.stringify(query))
                .then(response => {
                    if (response.message.length) {
                        req.flash('error', response.message);
                        return res.redirect('/forgot');
                    }
                    done(null, response.user);
                })
                .catch(err => {
                    console.error(err);
                    done(err);
                });
        },
        (user, done) => {
            var newPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
            var updatedUser = user;
            updatedUser.password = newPassword;
            requestToDB
                .updateUserInfo(updatedUser)
                .then(response => {
                    done(null, response.login);
                })
                .catch(err => {
                    console.error(err);
                    done(err);
                });
        },
        (login, done) => {
            var transporter = nodemailer.createTransport({
                service: 'Yandex',
                auth: {
                    user: config.emailLogin.email,
                    pass: config.emailLogin.password
                }
            });
            var mailOptions = {
                from: `PhotoQuestTeam3 <${config.emailLogin.email}>`,
                to: login,
                subject: 'PhotoQuest - Your password has been changed',
                text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' +
                        login + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions, err => {
                // var data = {message: 'Success! Your password has been changed.'};
                // res.redirect('profile');
                res.redirect('/');
                done(err);
            });
        }
    ], err => {
        console.error(err);
        return next(err);
    });
};
