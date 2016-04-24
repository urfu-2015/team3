const fs = require('fs');
var handlebars = require('hbs').handlebars;
var layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));

exports.addQuest = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/quest/addQuest.hbs', 'utf8'));
    res.send(template(Object.assign({
        title: 'Создание квеста',
        navbarTitle: 'Создание квеста',
        photo: [
            'http://www.segodnya.ua/img/article/6329/13_main.jpg',
            'http://cs418817.vk.me/v418817982/5866/JIvIF7yMjcs.jpg',
            'http://fonday.ru/images/tmp/16/7/original/16710fBjLzqnJlMXhoFHAG.jpg',
            'http://byaki.net/uploads/posts/2008-10/1225141003_1-21.jpg',
            'http://fishki.net/picsw/042010/27/bonus/kotiki/042.jpg'
        ]
    }, req.commonData)));
};
