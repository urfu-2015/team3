const passport = require('../lib/passport');

exports.register = (req, res) => {
    res.render('register', Object.assign({
        error: req.query.error
    }, req.commonData));
};

exports.login = (req, res) => {
    res.render('login', req.commonData);
};

exports.registerAction = (req, res, next) => {
    var existsUser = passport.login.find(function (user) {
        return user.login === req.body.email;
    });
    if (existsUser) {
        res.redirect('/register?error=duplicate');
        return;
    }

    var user = {
        login: req.body.email,
        password: req.body.password,
        id: req.body.email
    };

    passport.login.push(user);
    req.login(user, function (err) {
        return err ? next(err) : res.redirect('/');
    });
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.loginAction = (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            next(err);
            return;
        }
        if (user) {
            req.logIn(user, err => {
                return err ? next(err) : res.redirect('/');
            });
        } else {
            res.redirect('/login');
        }
    })(req, res, next);
};
