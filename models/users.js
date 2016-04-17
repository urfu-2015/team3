'use strict'

const dbName = 'kafkatist';
const apiKey = require('../apiKey').apiKey;
const mLab = require('mongolab-data-api')(apiKey);

class User {
	constructor(login, password) {
		this.login = login;
		this.password = password;
		this.passedQuests = [];
		this.myQuests = [];
		this.wishList = [];
		this.isBanned = false;
		this.photos = [];
	};

	setNickname(nickname) {
		this.nickname = nickname;
	}

	setAvatar(url) {
		this.avatar = url;
	};

	setGender(gender) {
		this.gender = gender;
	};

	addPhoto(photo) {
		this.photos.push(photo);
	};

	save() {
		var login = this.login;
		var password = this.password;
		var nickname = this.nickname;
		var passedQuests = this.passedQuests;
		var myQuests = this.myQuests;
		var wishList = this.wishList;
		var isBanned = this.isBanned;
		var photos = this.photos;
		var avatar = this.avatar;
		var gender = this.gender;
		var options = {
			database: dbName,
			collectionName: 'users',
			documents: {
				login,
				password,
				nickname,
				passedQuests,
				myQuests,
				wishList,
				isBanned,
				photos,
				avatar,
				gender
			}
		};
		mLab.insertDocuments(options, (err, result) => {
            if (err) {
            	console.log(err);
            }
        });
	};
}

module.exports = User;
