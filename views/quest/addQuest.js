require('./addQuest.styl');
require('./footer.styl');
/* eslint-disable no-unused-expressions*/
'use strict';

const Swiper = require('swiper');
/* eslint-disable no-unused-vars*/
const swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    slidesPerView: 'auto',
    // centeredSlides: true,
    paginationClickable: true,
    grabCursor: true,
    spaceBetween: 20
});

const form = document.forms.addQuestForm;
const btnBack = form.back;
btnBack.addEventListener('click', () => {
    window.history.back();
}, false);

const previewPhotoInput = form.preview;
previewPhotoInput.addEventListener('change', () => {
    const previewPhoto = previewPhotoInput.files[0];
    const reader = new FileReader();
    const uploader = document.querySelector('.upload-photo');
    reader.addEventListener('load', function () {
        $(uploader).css('background-image',
            `url('${reader.result.replace(/(\r\n|\n|\r)/gm, '')}')`);
        $(uploader).css('background-size', 'cover');
        const icon = document.querySelector('.quest-preview-photo .upload-photo-icon');
        $(icon).css('opacity', '0');
    });
    reader.readAsDataURL(previewPhoto);
});

const photosInput = form.photos;
photosInput.addEventListener('change', () => {
    const photos = photosInput.files;

    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.type.match('image')) {
            const reader = new FileReader();
            reader.addEventListener('load', function () {
                const url = reader.result.replace(/(\r\n|\n|\r)/gm, '');
                swiper.appendSlide(
                    `<div class="swiper-slide"><img src="${url}" class="img-rounded"></div>`);
            });
            reader.readAsDataURL(photo);
        }
    }
});

function fileApiSupported() {
    return window.Blob && window.FileList && window.FileReader;
}
