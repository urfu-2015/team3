require('./error.styl');

var back = document.getElementById('back');
back.addEventListener('click', () => {
    window.history.back();
}, false);
