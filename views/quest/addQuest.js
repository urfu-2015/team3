require('./addQuest.styl');
var width = screen.width;
var buttons = Array.from(document.querySelectorAll('.btn'));
if (width <= 320) {
    buttons.forEach(function (button) {
        $(button).addClass("btn-xs");
    });
} else if (width <= 375) {
    buttons.forEach(function (button) {
        $(button).addClass("btn-sm");
    });
}
// var form = document.forms.addQuestForm;
// console.log(form.elements);
