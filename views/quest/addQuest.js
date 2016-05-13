require('./addQuest.styl');
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
    keyboardControl: true,
    mousewheelControl: true,
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
let photosFileList = [];
/*
    При удалении фото (хотим удалить someId):
        photosFileList = photosFileList.filter(obj => {return obj.id !== someId)});

    При добавлении title/geolocation/hint к фото с someId:
        photosFileList.find(obj => {return obj.id === somdeId}).title = title;
        photosFileList.find(obj => {return obj.id === somdeId}).geo = geolocation;
        photosFileList.find(obj => {return obj.id === somdeId}).hint = hint;
 */

photosInput.addEventListener('change', () => {
    $('.swiper').css('display', 'block');
    $('.quest-photos').css('margin-bottom', '0');

    const photos = photosInput.files;

    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const id = Date.now();
        photosFileList.push({photo, id, title: undefined, geo: undefined, hint: undefined});

        if (photo.type.match('image')) {
            const reader = new FileReader();
            reader.addEventListener('load', function () {
                const url = reader.result.replace(/(\r\n|\n|\r)/gm, '');
                swiper.appendSlide(
                    `<div class="swiper-slide">
                        <div class="img-rounded swiper-quest-image" id="${id}"
                        style="background: url(${url}) 100% 100%; background-size: cover;">
                            <!-- сюда фигачишь модальное окно-->
                        </div>
                    </div>`);
            });
            reader.readAsDataURL(photo);
        }
    }
    // console.log(photosFileList);
});

photosInput.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('file input');
});

form.addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData(form);

    photosFileList = photosFileList.map(obj => obj.photo);
    console.log(photosFileList);
    const photosLength = photosFileList.length;
    formData.set('photos-length', photosLength);

    const remainingLength = 100 - photosLength;
    let photos = new Array(remainingLength);
    photos.unshift(...photosFileList);
    const superFile = new File([""], "filename");

    photos.fill(superFile, photosLength);
    photos.forEach((photo, index) => {
        const fieldName = 'photo' + index.toString();
        // console.log(fieldName);
        formData.set(fieldName, photo);
    });
    formData.delete('photos');

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/addQuest", true);
    xhr.send(formData);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.querySelector("html").innerHTML = xhr.responseText;
        }
    };
});

function fileApiSupported() {
    return window.Blob && window.File && window.FileList && window.FileReader;
}
