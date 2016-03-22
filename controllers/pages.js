const _ = require('lodash');
exports.index = (req, res) => {
    res.render('index', Object.assign({
        message: `Hello, ${_.get(req, 'user.login', 'User')}!`
    }, req.commonData));
};

exports.error404 = (req, res) => res.sendStatus(404);
