const argv = require('minimist')(process.argv.slice(2));
console.log(argv);
console.log(process.env.API_KEY);
module.exports = {
    apiKey: process.env.API_KEY
};
