'use strict';

const searcher = require('./searcher.js');

searcher.connectTo('tags');

searcher.getAllTags();

console.log('DONE');

searcher.connectTo('quests');

searcher.getQuests('Cats');
