'use strict';

const dbName = 'kafkatist';
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);

class Comment {
    constructor(commentObject) {
        this.url = commentObject.url;
        this.slug = commentObject.slug;
        this.body = commentObject.body;
        this.author = commentObject.author;
        this.date = getFormattedDate();
    }

    static getComments(query) {
        return new Promise((resolve, reject) => {
            var options = {
                database: dbName,
                collectionName: 'comments',
                query: JSON.stringify(query)
            };
            mLab.listDocuments(options, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    save() {
        var url = this.url;
        var slug = this.slug;
        var body = this.body;
        var date = this.date;
        var author = this.author;

        return new Promise((resolve, reject) => {
            var options = {
                database: dbName,
                collectionName: 'comments',
                documents: {
                    url,
                    slug,
                    body,
                    author,
                    date
                }
            };
            mLab.insertDocuments(options, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
}

module.exports = Comment;

function getFormattedDate() {
    var date = new Date();
    var month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
                'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    var day = [date.getDate(), month[date.getMonth()], date.getFullYear()].join(' ');
    var time = [date.getHours(), date.getMinutes()].join(':');
    return day + ' ' + time;
}
