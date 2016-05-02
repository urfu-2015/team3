require('./questslist.styl');
require('./jquery.dotdotdot.js');

$(document).ready(function() {
    $(".description").dotdotdot({
        watch: 'window' 
    });
});