const argv = require('minimist')(process.argv.slice(2));
console.log(argv);
module.exports = {
    apiKey: process.env.API_KEY
};
