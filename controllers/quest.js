'use strict';

const fs = require('fs');
const handlebars = require('hbs').handlebars;
const layouts = require('handlebars-layouts');
const questModel = require('../models/quest');
const userModel = require('../models/user');
const CommentsModel = require('../models/comments');
const async = require('async');
const requestToDB = require('../lib/auth/requestToDB');

handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));
const multer = require('multer');

var memoryStorage = multer.memoryStorage();
const upload = multer({storage: memoryStorage});
const Quest = require('../models/quest.js');
const cloudinary = require('../lib/cloudinary-images/cloudinary-loader');
const Datauri = require('datauri');
const path = require('path');

let fields = [{name: 'preview', maxCount: 1}];
for (let i = 0; i < 100; i++) {
    const fieldName = 'photo' + i.toString();
    fields.push({name: fieldName, maxCount: 1});
}

exports.addQuest = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/quest/addQuest.hbs', 'utf8'));
    res.send(template(Object.assign({title: 'Создание квеста'}, req.commonData)));
};

exports.loadPhoto = upload.fields(fields);

exports.createQuest = (req, res, next) => {
    // console.log(req.body);
    // console.log(req.files);
    let promise = Promise.resolve();
    if (req.files.preview) {
        const preview = req.files.preview[0];
        const dataUri = new Datauri();
        dataUri.format(path.extname(preview.originalname).toString(), preview.buffer);

        /* eslint-disable no-unused-vars*/
        promise = new Promise((resolve, reject) => {
            cloudinary.uploadImage(dataUri.content, Date.now().toString(), imageURL => {
                resolve(imageURL);
            });
        });
    }

    promise
        .then(previewUrl => {
            const photosLength = req.body['photos-length'];
            let photos = [];
            let reqPhotos = [];
            if (photosLength > 0) {
                for (let i = 0; i < photosLength; i++) {
                    const fieldName = 'photo' + i.toString();
                    reqPhotos.push(req.files[fieldName][0]);
                }
            }
            if (reqPhotos) {
                // console.log(reqPhotos);
                photos = reqPhotos.map((photo, index) => {
                    const dataUri = new Datauri();
                    dataUri.format(path.extname(photo.originalname).toString(), photo.buffer);
                    const photoAlt = 'Фото ' + index;
                    /* eslint-disable no-unused-vars*/
                    return new Promise((resolve, reject) => {
                        cloudinary.uploadImage(dataUri.content, Date.now().toString(), imageURL => {
                            resolve({
                                url: imageURL,
                                alt: photoAlt
                            });
                        });
                    });
                });
            }

            Promise.all(photos)
                .then(photos => {
                    const tags = req.body['quest-tags'].split(', ').filter(tag => tag.length > 0);
                    const quest = new Quest({
                        currentUserID: req.user,
                        displayName: req.body['quest-name'],
                        cityName: req.body['quest-city'],
                        author: req.user,
                        titleImage: previewUrl,
                        description: req.body['quest-description'],
                        tags,
                        duration: req.body['quest-duration'],
                        date: Date.now(),
                        photos
                    });
                    /* eslint-disable no-unused-vars*/
                    quest.save((err, message, result) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        })
        .catch(err => {
            console.error(err);
        });
    next();
    /*
     Добавить:
      - получение автора из данных авторизации
     Не хватает в клиентском коде:
      - alt, geolocation у photos
      - тэги: прикрутить как в поиске
     Вопросы:
      - дата: формат?
     */
};

exports.questPage = (req, res) => {
    // заглушка пока нет страниц квестов
    var template = handlebars.compile(fs.readFileSync('./views/quest/questPage.hbs', 'utf8'));
    var data = {title: 'Страница квеста', currentUserID: req.user};
    res.send(template(Object.assign(data, req.commonData)));
};

exports.getQuest = (req, res, next) => {
    var slug = req.params.slug;
    async.waterfall([
        done => {
            questModel.getQuests({slug: slug}, (err, result) => {
                if (err) {
                    done(err, null);
                } else {
                    result.length ? done(null, result[0]) : res.redirect('/search');
                }
            });
        },
        (quest, done) => {
            requestToDB
                .getPanorama(quest.cityName)
                .then(url => {
                    quest.panorama = url;
                    done(null, quest);
                })
                .catch(err => {
                    done(err, null);
                });
        },
        (quest, done) => {
            var isNotLogged = req.isAuthenticated();
            quest = setIdForComments(quest, isNotLogged);
            done(null, quest);
        },
        (quest, done) => {
            userModel
                .getUsers({})
                .then(result => {
                    done(null, result, quest);
                })
                .catch(err => {
                    done(err);
                });
        },
        (users, quest, done) => {
            CommentsModel
                .getComments({slug: slug})
                .then(result => {
                    done(null, users, divideComments(result, quest, users));
                })
                .catch(err => {
                    done(err, null);
                });
        },
        (users, quest, done) => {
            done(null, getCurrentUser(users, req.user), quest);
        },
        (user, quest, done) => {
            var btnData = {phrase: 'Хочу пройти', classStyle: 'btn-success'};
            var phrase = 'Хочу пройти';
            if (user && user.wishList && user.wishList.indexOf(slug) !== -1) {
                btnData.phrase = 'Не хочу проходить';
                btnData.classStyle = 'btn-danger';
            }
            quest = Object.assign(btnData, quest);
            quest.currentUserID = req.user;
            var templ = handlebars.compile(fs.readFileSync('./views/quest/questPage.hbs', 'utf8'));
            res.send(templ(Object.assign(quest, req.commonData)));
            done(null);
        }
    ], err => {
        if (err) {
            console.error(err);
            return next(err);
        }
    });
};

exports.addToWishList = (req, res, next) => {
    var userID = req.user;
    var slug = req.body.slug;
    var query = {_id: {$oid: userID}};
    async.waterfall([
        done => {
            userModel
                .findUser(JSON.stringify(query))
                .then(result => {
                    done(null, result.user);
                })
                .catch(err => {
                    done(err);
                });
        },
        (user, done) => {
            user.wishList = user.wishList || [];
            var index = user.wishList.indexOf(slug);
            var phrase = index === -1 ? 'Не хочу проходить' : 'Хочу пройти';
            index === -1 ? user.wishList.push(slug) : user.wishList.splice(index, 1);
            userModel
                .updateUserInfo(user)
                .then(updatedUser => {
                    return res.status(200).send({phrase: phrase});
                })
                .catch(err => {
                    done(err);
                });
        }
    ], err => {
        return err ? next(err) : next();
    });
};

exports.addPhotoComment = (req, res, next) => {
    var userID = req.user;
    var slug = req.body.slug;
    var url = req.body.url;
    var body = req.body.text;
    async.waterfall([
        done => {
            userModel
                .findUser(JSON.stringify({_id: {$oid: userID}}))
                .then(result => {
                    var author = result.user.nickname;
                    var authorPhoto = result.user.avatar;
                    done(null, author, authorPhoto);
                })
                .catch(err => {
                    done(err);
                });
        },
        (author, authorPhoto, done) => {
            var newComment = new CommentsModel({
                url,
                slug,
                body,
                author: userID
            });

            newComment
                .save()
                .then(result => {
                    var date = result.date;
                    var authorID = userID;
                    var data = {authorPhoto, author, body, date, authorID};
                    res.status(200).send(data);
                })
                .catch(err => {
                    done(err);
                });
        }
    ], err => {
        return err ? next(err) : next();
    });
};

exports.addQuestComment = (req, res, next) => {
    var userID = req.user;
    var slug = req.body.slug;
    var body = req.body.text;
    async.waterfall([
        done => {
            userModel
                .findUser(JSON.stringify({_id: {$oid: userID}}))
                .then(result => {
                    var author = result.user.nickname;
                    var authorPhoto = result.user.avatar;
                    done(null, author, authorPhoto);
                })
                .catch(err => {
                    done(err);
                });
        },
        (author, authorPhoto, done) => {
            var newComment = new CommentsModel({
                slug,
                body,
                author: userID
            });

            newComment
                .save()
                .then(result => {
                    var date = result.date;
                    var authorID = userID;
                    var data = {authorPhoto, author, body, date, authorID};
                    res.status(200).send(data);
                })
                .catch(err => {
                    done(err);
                });
        }
    ], err => {
        return err ? next(err) : next();
    });
};

function getSpecPhotoUrl(url) {
    var urlParts = url.split('/');
    return urlParts[urlParts.length - 1].toLowerCase().replace(/[^\w\-]+/g, '');
}

function setIdForComments(quest, isNotLogged) {
    var photos = [];
    quest.photos.forEach(photo => {
        photo.commentUrl = getSpecPhotoUrl(photo.url);
        photo.isNotLogged = isNotLogged;
        photos.push(photo);
    });
    quest.photos = photos;
    return quest;
}

function getCurrentUser(users, id) {
    var user = users.filter(user => {
        return user._id.$oid === id;
    });
    return user[0];
}

function divideComments(allComments, quest, users) {
    allComments.forEach(comment => {
        comment.authorID = comment.author;
        var authorInfo = getAuthorInfo(users, comment.author);
        if (authorInfo) {
            comment.author = authorInfo.author;
            comment.authorPhoto = authorInfo.authorPhoto;
        }
        if (comment.url) {
            var index = getPhotoIndex(comment.url, quest);
            if (index !== -1) {
                quest.photos[index].comments = quest.photos[index].comments || [];
                quest.photos[index].comments.push(comment);
            }
        } else {
            quest.questComments = quest.questComments || [];
            quest.questComments.push(comment);
        }
    });
    return quest;
}

function getAuthorInfo(users, id) {
    var user = users.filter(user => {
        return user._id.$oid === id;
    });
    return {author: user[0].nickname, authorPhoto: user[0].avatar};
}

function getPhotoIndex(url, quest) {
    for (var i = 0; i < quest.photos.length; i++) {
        if (quest.photos[i].url === url) {
            return i;
        }
    }
    return -1;
}

