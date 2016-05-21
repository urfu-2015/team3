var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'kafkatist', // eslint-disable-line camelcase
    api_key: '553966127742773', // eslint-disable-line camelcase
    api_secret: 'Z4CBD2yYrE_TDehPS271VY0_Z1A' // eslint-disable-line camelcase
});

exports.uploadImage = (path, filename, callback) => {
    cloudinary.uploader.upload(path, function (result) {
        callback(result.secure_url);
    }, {public_id: filename, resource_type: 'image'}); // eslint-disable-line camelcase
};
