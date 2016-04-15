const argv = require('minimist')(process.argv.slice(2));
console.log(argv);
console.log(process.env);
module.exports = {
    apiKey: process.env.API_KEY
};
