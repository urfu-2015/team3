const passport = require('../lib/passport');

exports.register = (req, res) => {
    res.render('register', req.commonData);
};

exports.login = (req, res) => {
    res.render('login', req.commonData);
};

exports.registerAction = (req, res, next) => {
    var user = {
        login: req.body.email,
        password: req.body.password
    };
    passport
        .registerUser(user, next)
        .then(() => {
            req.login(user, err => {
                err ? next(err) : res.redirect('/');
            });
        })
        .catch(err => {
            console.error(err);
            res.redirect('/register?error=duplicate');
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
