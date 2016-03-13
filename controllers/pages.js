exports.index = (req, res) => {
    res.send('hello world');
};
exports.error404 = (req, res) => res.sendStatus(404);
