const fs = require('fs');
var handlebars = require('hbs').handlebars;
var layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));

exports.index = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/main/main.hbs', 'utf8'));
    res.send(template(Object.assign({
        title: 'Layout Test',
        items: [
            'apple',
            'orange',
            'banana'
        ]
    }, req.commonData)));
};

exports.error404 = (req, res) => {
    res.sendStatus(404);
};

exports.createquest = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/slider/slider.hbs', 'utf8'));
    res.send(template(Object.assign({
        photo: [
            'http://www.segodnya.ua/img/article/6329/13_main.jpg',
            'http://cs418817.vk.me/v418817982/5866/JIvIF7yMjcs.jpg',
            'http://fonday.ru/images/tmp/16/7/original/16710fBjLzqnJlMXhoFHAG.jpg',
            'http://byaki.net/uploads/posts/2008-10/1225141003_1-21.jpg',
            'http://fishki.net/picsw/042010/27/bonus/kotiki/042.jpg'
        ]
    }, req.commonData)));
};
