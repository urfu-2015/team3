'use strict';

const fs = require('fs');
const handlebars = require('hbs').handlebars;
const layouts = require('handlebars-layouts');
const questModel = require('../models/quest');
const userModel = require('../models/user');
const CommentsModel = require('../models/comments');
const async = require('async');
const requestToDB = require('../lib/auth/requestToDB');
const geolib = require('geolib');

handlebars.registerHelper('ifIn', function (elem, list, options) {
    if (!list) {
        return ""; // если пользователь не вошел
    }

    if (list.indexOf(elem.toString()) > -1) {
        return options.fn(this);
    }
    return options.inverse(this);
});

handlebars.registerHelper('ifNotIn', function (elem, list, options) {
    if (!list) {
        return options.fn(this);
    }

    console.log(elem, list);

    if (list.indexOf(elem.toString()) === -1) {
        return options.fn(this);
    }
    return options.inverse(this);
});

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
for (let i = 0; i < 30; i++) {
    const fieldName = 'photo' + i.toString();
    fields.push({name: fieldName, maxCount: 1});
}

exports.addQuest = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/quest/addQuest.hbs', 'utf8'));
    res.send(template(Object.assign({title: 'Создание квеста'}, req.commonData)));
};

exports.loadPhoto = upload.fields(fields);

exports.sendUserPhoto = (req, res, next) => {
    console.log(req.files.fileToUpload[0]); // сама фотка
    console.log(req.body.id); // id фотки в модели quest
    var parser = require('exif-parser').create(req.files.fileToUpload[0].buffer);
    var result = parser.parse();
    console.log(result);
    console.log(req.body);
    questModel
        .getQuests({slug: req.body.slug}, (err, quest) => {
            if (err) {

            } else {
                var id = parseInt(req.body.id, 10);
                var lat = quest[0].photos[id].geolocation.lat;
                var lng = quest[0].photos[id].geolocation.lng;
                var userLat = req.body.latitude;
                var userLng = req.body.longitude;
                var distance = geolib.getDistance(
                    {latitude: lat, longitude: lng},
                    {latitude: req.body.latitude, longitude: req.body.longitude}
                );
                var maxDistance = 500;
                console.log(distance);
                console.log(quest[0].photos[id].geolocation);
                if (distance <= maxDistance) {
                    var userID = req.user;
                    var newMarker = {lat: userLat, lng: userLng};
                    var preview = req.files.fileToUpload[0];
                    var dataUri = new Datauri();
                    dataUri.format(path.extname(preview.originalname).toString(), preview.buffer);

                    /* eslint-disable no-unused-vars*/
                    var promise = new Promise((resolve, reject) => {
                        cloudinary.uploadImage(dataUri.content, Date.now().toString(), imageURL => {
                            resolve(imageURL);
                        });
                    });

                    promise
                        .then(previewUrl => {
                            userModel
                                .findUser(JSON.stringify({_id: {$oid: userID}}))
                                .then(found => {
                                    var user = found.user;

                                    // надо добавить фото к пользователю в activeQuests
                                    // и проверить, что если уже все фотки к квесту пройдены,
                                    // то добавить квест в пройденное

                                    if (user.activeQuests[quest[0].slug] &&
                                     quest[0].photos.length === user.activeQuests[quest[0].slug].length + 1) {
                                        // если это была последняя фотка чтобы пройти квест
                                        user.passedQuests.push(quest[0].slug);
                                    }
                                    // добавляем фотографию в пройденные

                                    if (!user.activeQuests[quest[0].slug]) {
                                        user.activeQuests[quest[0].slug] = [];
                                    }
                                    user.activeQuests[quest[0].slug].push(req.body.id);

                                    user.markers.push(newMarker);
                                    user.photos = user.photos || [];
                                    user.photos.push(previewUrl);

                                    userModel
                                        .updateUserInfo(user)
                                        .then(result => {
                                            res.send('good photo');
                                        })
                                        .catch(err => next(err));
                                })
                                .catch(err => next(err));
                        })
                        .catch(err => {
                            next(err);
                        });
                } else {
                    res.send('wrong photo');
                }
            }
        });
};

exports.loadUserPhoto = upload.fields([{name: 'fileToUpload', maxCount: 1}]);

exports.createQuest = (req, res, next) => {
    let promise = Promise.resolve();
    const photoAttributes = JSON.parse(req.body.photoAttributes);
    // console.log(photoAttributes);
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
            // console.log('photosLength:');
            // console.log(photosLength);
            if (photosLength > 0) {
                for (let i = 0; i < photosLength; i++) {
                    const fieldName = 'photo' + i.toString();
                    // console.log(fieldName);
                    // console.log(req.files[fieldName][0]);
                    reqPhotos.push(req.files[fieldName][0]);
                }
            }
            if (reqPhotos) {
                // console.log(reqPhotos);
                photos = reqPhotos.map((photo, index) => {
                    const dataUri = new Datauri();
                    dataUri.format(path.extname(photo.originalname).toString(), photo.buffer);
                    // const photoAlt = 'Фото ' + index;
                    /* eslint-disable no-unused-vars*/
                    return new Promise((resolve, reject) => {
                        cloudinary.uploadImage(dataUri.content, Date.now().toString(), imageURL => {
                            resolve({
                                url: imageURL,
                                title: photoAttributes[index].title,
                                geolocation: photoAttributes[index].geolocation,
                                hint: photoAttributes[index].hint
                            });
                        });
                    });
                });
            }

            Promise.all(photos)
                .then(photos => {
                    // console.log(photos);
                    const tags = req.body['quest-tags'].split(', ').filter(tag => tag.length > 0);
                    const quest = new Quest({
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
                            console.log(message);
                        } else {
                            // console.log('slug1');
                            // console.log(result.slug);
                            req.slug = result.slug;
                        }
                    });
                })
                .then(() => {
                    next();
                })
                .catch(err => {
                    console.error(err);
                });
        })
        .catch(err => {
            console.error(err);
        });
    /*
     Добавить:
      - получение автора из данных авторизации
     Не хватает в клиентском коде:
      - alt, geolocation у photos
      - тэги: прикрутить как в поиске
     Вопросы:
      - дата: формат?
      14 мая 2016
      зачем дата?
     */
};

exports.questPage = (req, res, next) => {
    // var template = handlebars.compile(fs.readFileSync('./views/quest/questPage.hbs', 'utf8'));
    // var data = {title: 'Страница квеста', currentUserID: req.user};
    // res.send(template(Object.assign(data, req.commonData)));
    // console.log('slug2');
    // console.log(req.slug);
    if (req.slug) {
        res.redirect('/quest/' + req.slug);
    } else {
        // ошибка?
        res.redirect('/');
    }
    next();
};

exports.addToMyQuests = (req, res, next) => {
    if (req.user && req.slug) {
        var userID = req.user;
        var slug = req.slug;
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
                user.myQuests.push(slug);
                userModel
                    .updateUserInfo(user)
                    .then(updatedUser => {
                        return res.status(200).send({});
                    })
                    .catch(err => {
                        done(err);
                    });
            }
        ], err => {
            return err ? next(err) : next();
        });
    }
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
            var isLogged = req.isAuthenticated();
            quest = setIdForComments(quest, isLogged);
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
            quest.author = getCurrentUser(users, quest.author).nickname;
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

            if (user) {
                quest.passedPhotos = user.activeQuests[quest.slug] || [];
            }

            quest.currentUserID = req.user;

            console.log(quest);

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

function setIdForComments(quest, isLogged) {
    var photos = [];
    quest.photos.forEach(photo => {
        photo.commentUrl = getSpecPhotoUrl(photo.url);
        photo.isLogged = isLogged;
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
