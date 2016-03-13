exports.index = (req, res) => {
    res.render('index', Object.assign({
        message: 'Hello, User!'
    }, req.commonData));
};

exports.error404 = (req, res) => res.sendStatus(404);
