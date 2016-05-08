'use strict';

const userModel = require('../models/user');
const fs = require('fs');
const handlebars = require('hbs').handlebars;
const layouts = require('handlebars-layouts');
handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial('base', fs.readFileSync('./views/base.hbs', 'utf8'));

exports.getProfile = (req, res) => {
	        var userID = req.user;
	        userModel
		.findUser(JSON.stringify({_id: {$oid: userID}}))
		.then(user => {
			        var template = handlebars.compile(fs.readFileSync('./views/profile.hbs', 'utf8'));
			        res.send(template(Object.assign(user, req.commonData)));
		})
		.catch(err => {
			        if (err) {
				        console.error(err);
			}
		});
};
