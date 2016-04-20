'use strict';
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);
const dbName = 'kafkatist';

class quest {

    constructor(questObject) {
        this.questObject = questObject;
        this.fields = [
            'displayName',
            'cityName',
            'author',
            'titleImage',
            'description',
            'tags',
            'complexity',
            'rating',
            'duration',
            'date',
            'photos'
        ];
    }

    static deleteQuest(query, callback) {
        var options = {
            database: dbName,
            collectionName: 'quests',
            query: JSON.stringify(query)
        };
        mLab.deleteDocuments(options, (err, result) => {
            callback(err, result);
    });
    }

    slugify(text)
    {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    static updateQuests(data, query, callback) {
        // проверяем что не хотят добавить лишнее поле
        var error = false;
        for (var key in data) {
            if (this.fields.indexOf(key) == -1) {
                callback(true, []);
            }
        }
        var options = {
            database: dbName,
            collectionName: 'quests',
            data: data,
            query: JSON.stringify(query)
        };
        if (!error) {
            mLab.updateDocuments(options, (err, result) => {
                callback(err, result);
        });
        }
    }

    static getQuests(query, callback) {
        var options = {
            database: dbName,
            collectionName: 'quests',
            query: JSON.stringify(query)
        };
        mLab.listDocuments(options, (err, result) => {
            callback(err, result);
    });
    }

    save(callback) {
        var error = false;
        // если не задали displayName, возвращаем ошибку
        if (!this.questObject.displayName) {
            return callback(true, "displayName is missing", []);
        }
        // проверим что не передали лишних полей
        for (var key in this.questObject) {
            if (this.fields.indexOf(key) == -1) {
                return callback(true, "field '" + key + "' not in fields" , []);
            }
            if (key == "slug") {
                return callback(true, "you can't set 'slug' field, it will generated automatically", []);
            }
        }

        var displayName = this.questObject.displayName;
        var cityName = this.questObject.cityName || "";
        var author = this.questObject.author || "";
        var titleImage = this.questObject.titleImage || "";
        var description = this.questObject.description || "";
        var tags = this.questObject.tags || [];
        var complexity = this.questObject.complexity || {};
        var rating = this.questObject.rating || {};
        var duration = this.questObject.duration || "";
        var date = this.questObject.date || "";
        var photos = this.questObject.photos || [];
        var slug = this.slugify(this.questObject.displayName);

        // Проверяем что slug уникальный, если true добавляем
        if (!error) {
            quest.getQuests({
                slug: slug
            }, (err, results) => {
                if (!results.length) {
                var options = {
                    database: dbName,
                    collectionName: 'quests',
                    documents: {
                        displayName,
                        slug,
                        cityName,
                        author,
                        titleImage,
                        description,
                        tags,
                        complexity,
                        rating,
                        duration,
                        date,
                        photos
                    }
                };
                mLab.insertDocuments(options, (err, result) => {
                    callback(err, "", result);
            });
            } else {
                callback(true, "value of field 'displayName' exist in db, please change it", []);
            }
        });
        }
    };
}
module.exports = quest;