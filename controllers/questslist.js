'use strict';

const fs = require('fs');
var handlebars = require('hbs').handlebars;
var layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));


exports.questslist = (req, res) => {
    var template = handlebars.compile(fs.readFileSync('./views/questslist/questslist.hbs', 'utf8'));

    res.send(template(Object.assign({
        title: 'Layout Test',
        items: [
            'apple',
            'orange',
            'banana'
        ]
    }, req.commonData)));
};
