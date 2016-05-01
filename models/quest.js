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

    slugify(s, opt) {
        s = String(s);
        opt = Object(opt);

        var defaults = {
            delimiter: '-',
            limit: undefined,
            lowercase: true,
            replacements: {},
            transliterate: true
        };

        var k;
        for (k in defaults) {
            if (!opt.hasOwnProperty(k)) {
                opt[k] = defaults[k];
            }
        }

        var charMap = {
            // Latin
            'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç': 'C',
            'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
            'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ő': 'O',
            'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ű': 'U', 'Ý': 'Y', 'Þ': 'TH',
            'ß': 'ss',
            'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c',
            'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
            'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ő': 'o',
            'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th',
            'ÿ': 'y',

            // Russian
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
            'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
            'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C',
            'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sh', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
            'Я': 'Ya',
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
            'я': 'ya'
        };

        for (k in opt.replacements) {
            s = s.replace(RegExp(k, 'g'), opt.replacements[k]);
        }

        if (opt.transliterate) {
            for (k in charMap) {
                s = s.replace(RegExp(k, 'g'), charMap[k]);
            }
        }

        var alnum = RegExp('[^a-z0-9]+', 'ig');
        s = s.replace(alnum, opt.delimiter);

        s = s.replace(RegExp('[' + opt.delimiter + ']{2,}', 'g'), opt.delimiter);

        // Truncate slug to max. characters
        s = s.substring(0, opt.limit);

        // Remove delimiter from ends
        s = s.replace(RegExp('(^' + opt.delimiter + '|' + opt.delimiter + '$)', 'g'), '');

        return opt.lowercase ? s.toLowerCase() : s;
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
                return callback(true, "field '" + key + "' not in fields", []);
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
    }
}
module.exports = quest;
