const argv = require('minimist')(process.argv.slice(2));
console.log(argv);
module.exports = {
    apiKey: argv.API_KEY
};
