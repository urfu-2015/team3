require('./questslist.styl');
require('./searchQuests.js');

$(document).ready(function () {
    $(".description").dotdotdot({
        watch: 'window'
    });
});
