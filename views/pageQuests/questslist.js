require('./questslist.styl');
require('./searchQuests.js');

$(document).ready(function () {
    $(".description").dotdotdot({
        watch: 'window'
    });

    var quests = document.querySelector('.container-fluid');
    var questsChildren = [].slice.call(quests.children);
    if (questsChildren.length % 2 === 1) {
        var last = questsChildren[questsChildren.length - 1];
        last.style.textAlign = "center";
        last.style.marginLeft = "25%";
    }
});
