'use strict';

const async = require('async');

const userModel = require('../models/user');
const questModel = require('../models/quest');

const cloudinary = require('../lib/cloudinary-images/cloudinary-loader');

const fs = require('fs');
const handlebars = require('hbs').handlebars;
const layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));

exports.getProfile = (req, res, next) => {
    var userID = req.params.id;
    if (!userID) {
        if (req.isAuthenticated()) {
            userID = req.user;
        } else {
            return res.redirect('/notFound');
        }
    }
    async.waterfall([
        done => {
            userModel
                .findUser(JSON.stringify({_id: {$oid: userID}}))
                .then(result => {
                    if (result.message.length) {
                        res.redirect('');
                        return;
                    }
                    done(null, result.user);
                })
                .catch(err => {
                    done(err);
                });
        },
        (user, done) => {
            var questLists = [user.myQuests, user.passedQuests, user.wishList, user.activeQuests];
            var promises = [];
            questLists.forEach(list => {
                promises.push(questModel.getSomeQuests(list));
            });
            Promise
                .all(promises)
                .then(result => {
                    var profileInfo = {
                        id: userID,
                        nickname: user.nickname,
                        city: user.city,
                        avatar: user.avatar,
                        photos: user.photos,
                        myQuests: getQuestsInfo(result[0]),
                        passedQuests: getQuestsInfo(result[1]),
                        wishList: getQuestsInfo(result[2]),
                        activeQuests: getQuestsInfo(result[3]),
                        markers: JSON.stringify(user.markers),
                        currentUserID: req.user
                    };
                    done(null, profileInfo);
                })
                .catch(err => {
                    done(err);
                });
        },
        (result, done) => {
            var isCurrent = req.user === result.id ? {isCurrentUser: true} : {isCurrentUser: false};
            result = Object.assign(result, isCurrent);
            var templ = handlebars.compile(fs.readFileSync('./views/profile/profile.hbs', 'utf8'));
            res.send(templ(Object.assign(result, req.commonData)));
            done(null);
        }
    ], err => {
        err ? next(err) : next();
    });
};

exports.editProfile = (req, res, next) => {
    var userID = req.user;
    async.waterfall([
        done => {
            userModel
                .findUser(JSON.stringify({_id: {$oid: userID}}), {nickname: 1, avatar: 1, city: 1})
                .then(result => {
                    if (result.message.length) {
                        res.redirect('');
                        return;
                    }
                    done(null, result.user);
                })
                .catch(err => {
                    done(err);
                });
        },
        (user, done) => {
            var file = fs.readFileSync('./views/profile/editProfile.hbs', 'utf8');
            var templ = handlebars.compile(file);
            res.send(templ(Object.assign(user, req.commonData)));
            done(null);
        }
    ], err => {
        err ? next(err) : next();
    });
};

exports.updateProfile = (req, res, next) => {
    var userID = req.user;
    var avatar = req.body.avatar;
    async.waterfall([
        done => {
            userModel
                .findUser(JSON.stringify({_id: {$oid: userID}}))
                .then(result => {
                    if (result.message.length) {
                        res.redirect('');
                        return;
                    }
                    done(null, result.user);
                })
                .catch(err => {
                    next(err);
                });
        },
        (user, done) => {
            user.nickname = req.body.nickname;
            user.city = req.body.city;
            if (avatar) {
                var promise = new Promise((resolve, reject) => {
                    cloudinary.uploadImage(req.body.avatar, Date.now().toString(), imageURL => {
                        imageURL ? resolve(imageURL) : reject('smth wrong');
                    });
                });
                promise
                    .then(url => {
                        user.avatar = url;
                        userModel
                            .updateUserInfo(user)
                            .then(result => {
                                res.send(result);
                                done(null);
                            })
                            .catch(err => next(err));
                    })
                    .catch(err => {
                        next(err);
                    });
            } else {
                userModel
                    .updateUserInfo(user)
                    .then(result => {
                        res.send(result);
                    })
                    .catch(err => next(err));
            }
        }
    ], err => {
        err ? next(err) : next();
    });
};

function getQuestsInfo(list) {
    var result = [];
    list.forEach(element => {
        result.push({
            questSlug: element.slug,
            questName: element.displayName,
            questTitlePhoto: element.titleImage,
            questDescription: element.description
        });
    });
    return result;
}
