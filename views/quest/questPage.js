require('./questPage.styl');
var latitude;
var longitude;
var slug = document.getElementById('questName').getAttribute('data-slug');

$(document).ready(function () {
    $('.emoji-wysiwyg-editor').css('height', '44px');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        });
    } else {
        // view card
    }
});

$(function () {
    $("input[id$='_my-file-selector']").change(function () {
        uploadFile(this.id.slice(0, -17));
    });
});

function uploadFile(idPhoto) {
    var blobFile = $('#' + idPhoto + '_my-file-selector')[0].files[0];
    console.log(blobFile);
    var formData = new FormData();

    formData.set("fileToUpload", blobFile);
    formData.set("id", idPhoto);
    formData.set("latitude", latitude);
    formData.set("longitude", longitude);
    formData.set("slug", slug);

    $.ajax({
        url: "/sendUserPhoto",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            console.log(response);
        },
        error: function (jqXHR, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });
}

var questCommentsBox = document.getElementById('questCommentsBox');

var wishBtn = document.getElementById('wish');
if (wishBtn) {
    wishBtn.addEventListener('click', function () {
        addToWishList(slug);
    });
}

var addPhotoCommentBtn = document.getElementsByClassName('addComment');
[].slice.call(addPhotoCommentBtn).forEach(btn => {
    btn.addEventListener('click', function () {
        //addPhotoComment(btn.previousElementSibling);
        // берем id у кнопки 
        var btnId = btn.id.slice(19);
        // console.log(btnId);
        addPhotoComment(document.getElementById('addPhotoComment-' + btnId)); // надо передать кнопку
    });
});

var addQuestCommentBtn = document.getElementById('addQuestComment');
if (addQuestCommentBtn) {
    addQuestCommentBtn.addEventListener('click', function () {
        // addQuestComment(addQuestCommentBtn.previousElementSibling);
        addQuestComment(document.getElementById('testCommentQuest'));
    });
}

function addPhotoComment(commentInfo) {
    var url = commentInfo.getAttribute('data-url');
    var commentUrl = commentInfo.getAttribute('data-mc');
    var text = commentInfo.value;

    var xhr = new XMLHttpRequest();
    var params = 'slug=' + encodeURIComponent(slug) + '&url=' + encodeURIComponent(url) +
        '&text=' + encodeURIComponent(text);
    xhr.open('PUT', '/addPhotoComment', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    xhr.onreadystatechange = () => {
        if (xhr.status === 200 && xhr.readyState === 4) {
            var id = "cb_" + commentUrl;
            var commentsBox = document.getElementById(id);
            commentsBox.appendChild(createPhotoComment(JSON.parse(xhr.responseText)));
            commentInfo.value = '';
        }
    };
}

function addQuestComment(commentText) {
    var text = commentText.value;
    var xhr = new XMLHttpRequest();
    var params = 'slug=' + encodeURIComponent(slug) + '&text=' + encodeURIComponent(text);
    xhr.open('PUT', '/addQuestComment', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    xhr.onreadystatechange = () => {
        if (xhr.status === 200 && xhr.readyState === 4) {
            console.log(xhr.status);
            questCommentsBox.appendChild(createQuestComment(JSON.parse(xhr.responseText)));
            commentText.value = '';
            document.getElementById('noComments').style.display = 'none';
        }
    };
}

function createPhotoComment(data) {
    var authorPhoto = document.createElement('div');
    authorPhoto.classList.add('author-photo');
    var img = document.createElement('img');
    img.setAttribute('src', data.authorPhoto);
    authorPhoto.appendChild(img);

    var commentText = document.createElement('div');
    commentText.classList.add('comment-text');

    var name = document.createElement('p');
    name.classList.add('author-name');
    name.textContent = data.author;
    commentText.appendChild(name);

    var text = document.createElement('p');
    text.classList.add('text');
    text.textContent = data.body;
    commentText.appendChild(text);

    var date = document.createElement('p');
    date.classList.add('date');
    date.textContent = data.date;
    commentText.appendChild(date);

    var commentBox = document.createElement('div');
    commentBox.classList.add('commentBox');
    commentBox.appendChild(authorPhoto);
    commentBox.appendChild(commentText);
    return commentBox;
}

function createQuestComment(data) {
    var questComment = document.createElement('div');
    questComment.classList.add('questComment');

    var commentAuthorPhoto = document.createElement('div');
    commentAuthorPhoto.classList.add('commentAuthorPhoto');

    var img = document.createElement('img');
    img.setAttribute('src', data.authorPhoto);
    commentAuthorPhoto.appendChild(img);

    var commentData = document.createElement('div');
    commentData.classList.add('commentData');

    var commentAuthor = document.createElement('p');
    commentAuthor.classList.add('commentAuthor');
    commentAuthor.textContent = data.author;

    var commentContent = document.createElement('p');
    commentContent.classList.add('commentContent');
    commentContent.textContent = data.body;

    var commentDate = document.createElement('p');
    commentDate.classList.add('commentDate');
    commentDate.textContent = data.date;

    commentData.appendChild(commentAuthor);
    commentData.appendChild(commentContent);
    commentData.appendChild(commentDate);
    questComment.appendChild(commentAuthorPhoto);
    questComment.appendChild(commentData);
    return questComment;
}

function addToWishList(slug) {
    var xhr = new XMLHttpRequest();
    var params = 'slug=' + encodeURIComponent(slug);
    xhr.open('POST', '/addToWishList', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    xhr.onreadystatechange = () => {
        if (xhr.status === 200 && xhr.readyState === 4) {
            wishBtn.textContent = JSON.parse(xhr.responseText).phrase;
            if (wishBtn.classList.contains('btn-success')) {
                wishBtn.classList.remove('btn-success');
                wishBtn.classList.add('btn-danger');
            } else {
                wishBtn.classList.remove('btn-danger');
                wishBtn.classList.add('btn-success');
            }
        }
    };
}
