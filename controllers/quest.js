const fs = require('fs');
const handlebars = require('hbs').handlebars;
const layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));
const multer = require('multer');

var memoryStorage = multer.memoryStorage();
const upload = multer({storage: memoryStorage});
const Quest = require('../models/quest.js');
const cloudinary = require('../lib/cloudinary-images/cloudinary-loader');
const Datauri = require('datauri');
const path = require('path');

exports.addQuest = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/quest/addQuest.hbs', 'utf8'));
    res.send(template(Object.assign({title: 'Создание квеста'}, req.commonData)));
};

exports.loadPhoto = upload.fields([{name: 'preview', maxCount: 1}, {name: 'photos'}]);

exports.questPage = (req, res) => {
    const preview = req.files.preview[0];
    const dataUri = new Datauri();
    dataUri.format(path.extname(preview.originalname).toString(), preview.buffer);
    const reqPhotos = req.files.photos;

    /* eslint-disable no-unused-vars*/
    const promise = new Promise((resolve, reject) => {
        cloudinary.uploadImage(dataUri.content, Date.now().toString(), imageURL => {
            resolve(imageURL);
        });
    });

    promise
        .then(previewUrl => {
            const photos = reqPhotos.map((photo, index) => {
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

            Promise.all(photos)
                .then(photos => {
                    const tags = req.body['quest-tags'].split(', ');
                    const quest = new Quest({
                        displayName: req.body['quest-name'],
                        cityName: req.body['quest-city'],
                        author: 'Anna.Smith',
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

    /*
     Добавить:
      - получение автора из данных авторизации
     Не хватает в клиентском коде:
      - alt, geolocation у photos
      - тэги: прикрутить как в поиске
     Вопросы:
      - дата: формат?
     */

    // заглушка пока нет страниц квестов
    var template = handlebars.compile(fs.readFileSync('./views/quest/questPage.hbs', 'utf8'));
    res.send(template(Object.assign({title: 'Страница квеста'}, req.commonData)));
};
