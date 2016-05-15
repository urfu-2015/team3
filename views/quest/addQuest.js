require('./addQuest.styl');
/* eslint-disable no-unused-expressions*/
'use strict';

const Swiper = require('swiper');
/* eslint-disable no-unused-vars*/
const swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    slidesPerView: 'auto',
    paginationClickable: true,
    // grabCursor: true,
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
    const photo = previewPhotoInput.files[0];
    loadPhotoPreview(photo, showPreview);
    function showPreview(base64) {
        const uploader = document.querySelector('.upload-photo');
        $(uploader).css('background-image', `url('${base64}')`);
        $(uploader).css('background-size', 'cover');
        const icon = document.querySelector('.quest-preview-photo .upload-photo-icon');
        $(icon).css('opacity', '0');
    }
});

function loadPhotoPreview(photo, callback, args) {
    const reader = new FileReader();
    reader.addEventListener('load', function () {
        const base64 = reader.result.replace(/(\r\n|\n|\r)/gm, '');
        callback(base64, args);
    });
    reader.readAsDataURL(photo);
}

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
    showSwiperContainer();
    const photos = photosInput.files;

    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.type.match('image')) {
            const id = Date.now();
            photosFileList.push({photo, id, title: '', geo: undefined, hint: ''});
            const slideNumber = swiper.slides.length;
            loadPhotoPreview(photo, addSlide, {slideNumber, id});
        }
    }
    function addSlide(base64, args) {
        swiper.appendSlide(
            `<div class="swiper-slide" id="${args.slideNumber}">
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
        const modal = getModal(args.id);
        document.querySelector('body').appendChild(modal);
        initMap(args.id);
        deletePhotoHandler(args.id);
    }
});

function createHtml(htmlStr) {
    let frag = document.createDocumentFragment();
    let temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

function getErrorMsg(strongMsg, otherMsg) {
    return `<div class="alert alert-danger">
                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                <strong>${strongMsg}</strong> ${otherMsg}
            </div>`;
}

form.addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData(form);

    const photosLength = photosFileList.length;
    if (photosLength > 30) {
        const errorMsg = createHtml(getErrorMsg('Oops!', 'Выберите не более 30 квестовых фото'));
        document.body.insertBefore(errorMsg, form);
        return;
    } else if (photosLength < 2) {
        const errorMsg = createHtml(getErrorMsg('Oops!', 'Выберите не менее 2 квестовых фото'));
        document.body.insertBefore(errorMsg, form);
        return;
    }

    let photoAttributes = [];

    for (let i = 0; i < photosLength; i++) {
        const photoObj = photosFileList[i];
        if (photoObj.geo) {
            photoAttributes.push({
                title: photoObj.title,
                geolocation: photoObj.geo,
                hint: photoObj.hint
            });
        } else {
            const errorMsg = createHtml(getErrorMsg('Oops!', 'Укажите геолокацию для всех фото'));
            document.body.insertBefore(errorMsg, form);
            return;
        }
    }

    // console.log('attributes:');
    // console.log(photoAttributes);

    const photoFiles = photosFileList.map(obj => obj.photo);
    // console.log('photos:');
    // console.log(photoFiles);

    formData.set('photos-length', photosLength);

    const remainingLength = 30 - photosLength;
    let photos = new Array(remainingLength);
    photos.unshift(...photoFiles);
    const superFile = new File([""], "filename");

    photos.fill(superFile, photosLength);
    // console.log(photos);
    photos.forEach((photo, index) => {
        const fieldName = 'photo' + index.toString();
        formData.set(fieldName, photo);
    });
    formData.set('photoAttributes', JSON.stringify(photoAttributes));
    formData.delete('photos');

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/addQuest", true);
    xhr.send(formData);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // const html = document.createElement('html');
            // html.innerHTML = xhr.responseText;

            document.querySelector("html").innerHTML = xhr.responseText;
        }
    };
});

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
    deleteBtn.addEventListener('click', function (event) {
        if (document.activeElement === deleteBtn) {
            photosFileList = photosFileList.filter(obj => obj.id !== id);

            const slideId = event.target.parentNode.parentNode.getAttribute('id');
            swiper.removeSlide(slideId);
            // console.log('remove');
            // console.log(photosFileList);
            if (swiper.slides.length === 0) {
                hideSwiperContainer();
            }
        }
    });
}

function initMap(id) {
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
    var id = parseInt(event.target.id.split('_')[1], 10);
    var title = document.getElementById('title_' + id).value;
    var hint = document.getElementById('desc_' + id).value;
    photosFileList.find(obj => {
        return obj.id === id;
    }).title = title;
    photosFileList.find(obj => {
        return obj.id === id;
    }).hint = hint;
}

// Код, которым можно пугать детей :)

function getModal(id) {
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

    return modalDiv;
}
