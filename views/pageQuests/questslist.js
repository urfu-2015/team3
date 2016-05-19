require('./questslist.styl');
require('./searchQuests.js');

$(document).ready(function () {
    $(".description").dotdotdot({
        watch: 'window'
    });

    var container = document.querySelector('.container-fluid');
    container.addEventListener('click', function (e) {
        var target = e.target;
        var quest;
        var slug;
        if (target.classList.contains('blur') || target.classList.contains('quest-name')) {
            quest = target.parentElement;
            slug = quest.dataset.slug;
        }
        if (target.classList.contains('description')) {
            quest = target.parentElement.parentElement;
            slug = quest.dataset.slug;
        }
        if (quest !== undefined && slug !== undefined) {
            var path = window.location.href;
            var newPath = path.substring(0, path.length - 1) + '/' + slug;
            window.location.assign(newPath);
        }
    });
});
