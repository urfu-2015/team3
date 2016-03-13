const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var login = [
    {login: 'kafkatist1', password: '123', id: 'gfgf'},
    {login: 'kafkatist2', password: '123', id: 'gggg'},
    {login: 'kafkatist3', password: '123', id: '1234'},
    {login: 'kafkatist4', password: '123', id: '1456'}
];

passport.use(new LocalStrategy(
    function (username, password, done) {
        var user = login.find(function (item) {
            return username === item.login && password === item.password;
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false, {message: 'Incorrect username or password.'});
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    var user = login.find(function (user) {
        return user.id === id;
    });
    return cb(null, user);
});

module.exports = passport;
module.exports.login = login;
