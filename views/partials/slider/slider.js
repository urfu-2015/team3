require('./slider.styl');
const Swiper = require('swiper');
/* eslint-disable no-unused-vars*/
var swiper = new Swiper('.swiper-container', {
    scrollbar: '.swiper-scrollbar',
    scrollbarHide: true,
    slidesPerView: 'auto',
    spaceBetween: 30,
    grabCursor: true,
    slideToClickedSlide: true,
    pagination: '.swiper-pagination',
    paginationClickable: true
});
