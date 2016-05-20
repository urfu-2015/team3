require('./addQuest.styl');
require('./search.js');
/* eslint-disable no-unused-expressions*/
'use strict';

const Swiper = require('swiper');
/* eslint-disable no-unused-vars*/
const swiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    paginationClickable: true,
    grabCursor: true,
    keyboardControl: true,
    mousewheelControl: true,
    spaceBetween: 20
});

const form = document.querySelector('.addQuestForm');
let photosFileList = [];
let previewBase64 = '';
const questName = document.querySelector('#quest-name');
const questCity = document.querySelector('#quest-city');
const questDescription = document.querySelector('#quest-description');
const questDuration = document.querySelector('#quest-duration');
const questTags = document.querySelector('#quest-tags');

if (swiper.slides.length > 0) {
    showSwiperContainer();
    swiper.update(true);

    const slidesLength = swiper.slides.length;
    const swiperSlides = document.querySelectorAll('.swiper-slide');
    for (let i = 0; i < slidesLength; i++) {
        const slide = swiperSlides[i];
        const id = slide.getAttribute('data-id');
        const lat = slide.getAttribute('data-geo-lat');
        const lng = slide.getAttribute('data-geo-lng');
        const coords = [lat, lng];
        const title = slide.getAttribute('data-title');
        const hint = slide.getAttribute('data-hint');
        initEditElements(id, {coords, title, hint});
        photosFileList.push({
            id,
            url: slide.getAttribute('data-url'),
            title,
            geo: {
                lat,
                lng
            },
            hint: slide.getAttribute('data-hint')
        });
    }
    // console.log(photosFileList);
}

const btnBack = document.querySelector('#back');
const btnReset = document.querySelector('#clear');
const btnDelete = document.querySelector('#delete');
const btnSubmit = document.querySelector('#submit');

btnBack.addEventListener('click', () => {
    window.history.back();
}, false);

// очистка формы
const uploader = document.querySelector('.upload-photo');
const icon = document.querySelector('.quest-preview-photo .upload-photo-icon');

btnReset.addEventListener('click', event => {
    event.preventDefault();
    /* eslint-disable no-alert*/
    if (confirm('Вы уверены, что хотите напрочь стереть все заполненные поля?')) {
        questName.value = '';
        questCity.value = '';
        questDescription.value = '';
        questDuration.value = '';
        questTags.value = '';

        previewBase64 = '';
        $(uploader).attr('style', '');
        $(icon).attr('style', '');
        // photosFileList = [];
        const slidesLength = swiper.slides.length;
        for (let i = 0; i < slidesLength; i++) {
            if (photosFileList[i].base64) {
                swiper.removeSlide(i);
                swiper.update(true);
                photosFileList.pop();
            }
        }
        // console.log(photosFileList);
        if (swiper.slides.length === 0) {
            hideSwiperContainer();
        }
    }
}, false);

// загрузка превью
const previewPhotoInput = document.querySelector('#preview');

previewPhotoInput.addEventListener('change', () => {
    const photo = previewPhotoInput.files[0];
    loadBase64(photo, base64 => {
        previewBase64 = base64;
        showPreview(base64);
    });
});

function showPreview(url) {
    $(uploader).css('background-image', `url('${url}')`);
    $(uploader).css('background-size', 'cover');
    $(icon).css('opacity', '0');
}

// загрузка фото
const photosInput = document.querySelector('#photos');

photosInput.addEventListener('change', () => {
    showSwiperContainer();
    const photos = photosInput.files;

    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.type.match('image')) {
            let id = Date.now();
            const randomNumber = getRandomInt(100, 10000);
            id = ''.concat(id.toString(), randomNumber.toString());
            loadBase64(photo, addSlide, {id});
        }
    }

    function addSlide(base64, args) {
        photosFileList.push({base64, id: args.id, title: '', geo: null, hint: ''});
        swiper.appendSlide(
            `<div class="swiper-slide" id="${swiper.slides.length}">
                <div class="img-rounded swiper-quest-image"
                        style="background: url(${base64}) 100% 100%; background-size: cover;">
                    <a class="openmodal btn btn-default editBtn" href="#${args.id}"
                            data-toggle="modal">
                        <i class="fa fa-lg fa-pencil-square-o" aria-hidden="true"></i>
                    </a>
                    <button class="btn btn-default deleteBtn" id="delete_${args.id}">
                        <i class="fa fa-lg fa-trash-o" aria-hidden="true"></i>
                    </button>
                </div>
            </div>`);
        swiper.update(true);
        initEditElements(args.id);
    }
});

if (btnDelete) {
    // удаление квеста - пока безусловное
    btnDelete.addEventListener('click', function (event) {
        event.preventDefault();

        /* eslint-disable no-alert*/
        if (!confirm('Вы уверены, что хотите удалить квест?')) {
            return;
        }

        const slug = form.getAttribute('data-slug');
        const url = '/quest/' + slug + '/delete';
        $.ajax({
            url,
            type: "DELETE",
            success: function (response) {
                window.location.pathname = '/';
            },
            error: function (jqXHR, textStatus, errorMessage) {
                console.error(errorMessage);
            }
        });
    });
}

// отправка формы
btnSubmit.addEventListener('click', function (event) {
    event.preventDefault();

    const photosLength = photosFileList.length;
    if (photosLength > 30) {
        showErrorMsg('Выберите не более 30 квестовых фото');
        return;
    } else if (photosLength < 2) {
        showErrorMsg('Выберите не менее 2 квестовых фото');
        return;
    }

    let photoAttributes = [];
    let formData = {};
    let photoIndexes = [];
    for (let i = 0; i < photosLength; i++) {
        const photoObj = photosFileList[i];
        if (!photoObj.geo) {
            showErrorMsg('Укажите геолокацию для всех фото');
            return;
        } else if (photoObj.base64) {
            const fieldName = 'photo' + i;
            formData[fieldName] = photoObj.base64;
            photoIndexes.push(i);
        }
        photoAttributes.push({
            url: photoObj.url,
            title: photoObj.title,
            geolocation: photoObj.geo,
            hint: photoObj.hint,
            id: photoObj.id
        });
    }

    /* eslint-disable no-alert*/
    if (!confirm('Точно-точно хотите создать квест?')) {
        return;
    }

    formData['photos-length'] = photosLength;
    formData.photoAttributes = photoAttributes;
    formData.photoIndexes = photoIndexes;
    if (previewBase64) {
        formData.preview = previewBase64;
    }
    formData['quest-name'] = questName.value;
    formData['quest-city'] = questCity.value;
    formData['quest-description'] = questDescription.value;
    formData['quest-duration'] = questDuration.value;
    formData['quest-tags'] = questTags.value;
    // console.log(formData);
    const slug = form.getAttribute('data-slug');
    if (slug) {
        const url = '/quest/' + slug + '/edit';
        $.ajax({
            url,
            type: "PUT",
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                window.location.pathname = '/quest/' + slug;
            },
            error: function (jqXHR, textStatus, errorMessage) {
                console.error(errorMessage);
            }
        });
    } else {
        $.ajax({
            url: "/addQuest",
            type: "POST",
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                const slug = response.slug;
                if (slug) {
                    window.location.pathname = '/quest/' + slug;
                }
            },
            error: function (jqXHR, textStatus, errorMessage) {
                console.error(errorMessage);
            }
        });
    }
});

function showErrorMsg(msg) {
    const errorMsg = createHtml(getErrorMsg(msg));
    document.body.insertBefore(errorMsg, form);
    window.scrollTo(0, 0);
}

function loadBase64(photo, callback, args) {
    const reader = new FileReader();
    reader.addEventListener('load', function () {
        const base64 = reader.result.replace(/(\r\n|\n|\r)/gm, '');
        callback(base64, args);
    });
    reader.readAsDataURL(photo);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createHtml(htmlStr) {
    let frag = document.createDocumentFragment();
    let temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

function getErrorMsg(msg) {
    return `<div class="alert alert-danger">
                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                <strong>Oops!</strong> ${msg}
            </div>`;
}

function fileApiSupported() {
    return window.Blob && window.File && window.FileList && window.FileReader;
}

function showSwiperContainer() {
    $('.swiper').css('display', 'block');
    $('.quest-photos').css('margin-bottom', '0');
}

function hideSwiperContainer() {
    $('.swiper').css('display', 'none');
    $('.quest-photos').css('margin-bottom', '20px');
}

function deletePhotoHandler(id) {
    const btnId = 'delete_' + id;
    var deleteBtn = document.getElementById(btnId);
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function (event) {
            // if (document.activeElement === deleteBtn) {
            photosFileList = photosFileList.filter(obj => obj.id !== id);
            let swiperSlide = event.target.parentNode.parentNode;
            if (swiperSlide.className === 'img-rounded swiper-quest-image') {
                swiperSlide = swiperSlide.parentNode;
            }
            const slideId = swiperSlide.getAttribute('id');
            // console.log(slideId);
            // console.log(id);
            // console.log('photosFileList after:');
            // console.log(photosFileList);
            swiper.update(true);
            swiper.removeSlide(slideId);
            swiper.update(true);
            updateSlidesId();
            if (swiper.slides.length === 0) {
                hideSwiperContainer();
            }
        });
    }
}

function updateSlidesId() {
    const slidesLength = swiper.slides.length;
    const swiperSlides = document.querySelectorAll('.swiper-slide');
    for (let i = 0; i < slidesLength; i++) {
        swiperSlides[i].setAttribute('id', i.toString());
    }
}

function initMap(id, geoCoords) {
    /* eslint-disable no-undef*/
    ymaps.ready(init);
    function init() {
        var placemark;
        var map = new ymaps.Map('map_' + id, {
            center: [55.7522, 37.6155],
            zoom: 4,
            controls: ['zoomControl', 'fullscreenControl']
        });
        var search = new ymaps.control.SearchControl({options: {noPlacemark: true}});
        map.controls.add(search);
        map.events.add('click', function (event) {
            var coords = event.get('coords');
            if (placemark) {
                placemark.geometry.setCoordinates(coords);
            } else {
                placemark = new ymaps.Placemark(coords, {}, {draggable: true});
                map.geoObjects.add(placemark);
                placemark.events.add('dragend', function () {
                    setCoordinates(id, placemark.geometry.getCoordinates());
                });
            }
            setCoordinates(id, coords);
        });
        if (geoCoords) {
            if (placemark) {
                placemark.geometry.setCoordinates(geoCoords);
            } else {
                placemark = new ymaps.Placemark(geoCoords, {}, {draggable: true});
                map.geoObjects.add(placemark);
                placemark.events.add('dragend', function () {
                    setCoordinates(id, placemark.geometry.getCoordinates());
                });
            }
        }
    }
}

function setCoordinates(id, coords) {
    var geolocation = {
        lat: coords[0],
        lng: coords[1]
    };
    photosFileList.find(obj => {
        return obj.id === id;
    }).geo = geolocation;
}

function setInformation(event) {
    var id = event.target.id.split('_')[1];
    var title = document.getElementById('title_' + id).value;
    var hint = document.getElementById('desc_' + id).value;
    photosFileList.find(obj => {
        return obj.id === id;
    }).title = title;
    photosFileList.find(obj => {
        return obj.id === id;
    }).hint = hint;
}

function addModal(id, args = {}) {
    var modalDiv = document.createElement('div');
    modalDiv.setAttribute('class', 'modal fade');
    modalDiv.setAttribute('id', id);
    modalDiv.setAttribute('role', 'dialog');

    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('class', 'modal-dialog modal-lg');

    var contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', 'modal-content');
    contentDiv.setAttribute('id', 'back');
    var headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'modal-header');
    var header = document.createElement('h4');
    header.textContent = 'Редактирование фотографии';
    headerDiv.appendChild(header);
    contentDiv.appendChild(headerDiv);
    dialogDiv.appendChild(contentDiv);

    var bodyDiv = document.createElement('div');
    bodyDiv.setAttribute('class', 'modal-body');
    var nameP = document.createElement('p');
    nameP.textContent = 'Назовите фотографию';
    bodyDiv.appendChild(nameP);
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('class', 'photoTitle');
    input.setAttribute('id', 'title_' + id);
    if (args.title) {
        input.setAttribute('value', args.title);
    }
    bodyDiv.appendChild(input);
    bodyDiv.appendChild(document.createElement('br'));
    var mapP = document.createElement('p');
    mapP.textContent = 'Укажите местоположение';
    bodyDiv.appendChild(mapP);
    var mapDiv = document.createElement('div');
    mapDiv.setAttribute('id', 'map_' + id);
    mapDiv.setAttribute('class', 'map');
    bodyDiv.appendChild(mapDiv);
    bodyDiv.appendChild(document.createElement('br'));
    var descrP = document.createElement('p');
    descrP.textContent = 'Опишите место на фотографии';
    bodyDiv.appendChild(descrP);
    var textarea = document.createElement('textarea');
    textarea.setAttribute('class', 'hintArea');
    textarea.setAttribute('id', 'desc_' + id);
    if (args.hint) {
        textarea.value = args.hint;
    }
    bodyDiv.appendChild(textarea);
    contentDiv.appendChild(bodyDiv);

    var footer = document.createElement('footer');
    footer.setAttribute('class', 'modal-footer');
    var cancel = document.createElement('a');
    cancel.setAttribute('data-dismiss', 'modal');
    cancel.setAttribute('class', 'btn btn-warning');
    cancel.textContent = 'Отмена';
    footer.appendChild(cancel);
    var save = document.createElement('a');
    save.setAttribute('data-dismiss', 'modal');
    save.setAttribute('class', 'btn btn-success');
    save.textContent = 'Сохранить';
    save.setAttribute('id', 'save_' + id);
    save.addEventListener('click', setInformation);
    footer.appendChild(save);

    contentDiv.appendChild(footer);
    modalDiv.appendChild(dialogDiv);

    document.querySelector('body').appendChild(modalDiv);
}

function initEditElements(id, args = {}) {
    addModal(id, args);
    args.coords ? initMap(id, args.coords) : initMap(id);
    deletePhotoHandler(id);
}
