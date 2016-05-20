require('./editProfile.styl');

document.getElementById('back').addEventListener('click', () => {
    window.history.back();
}, false);

/* eslint-disable no-unused-vars*/
var avatar = '';
var saveBtn = document.getElementById('save');

document.getElementById('photo').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement;
    var files = tgt.files;
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
            document.getElementById('avatar').src = fr.result;
        };
        fr.readAsDataURL(files[0]);
        saveBtn.disabled = true;
        loadBase64($('#photo')[0].files[0], function (res) {
            avatar = res;
            saveBtn.disabled = false;
        });
    } else {
        console.log('smth wrong with fs');
    }
};

saveBtn.onclick = function (event) {
    var message = document.getElementById('message');
    var nickname = document.getElementById('nickname').value;
    var city = document.getElementById('city').value;
    var data = {nickname, city, avatar};
    $.ajax({
        url: "/updateProfile",
        contentType: 'application/json',
        type: "PUT",
        data: JSON.stringify(data),
        success: function (result) {
            message.classList.add('alert-warning');
            message.textContent = 'Данные обновлены.';
            message.style.display = 'block';
        },
        error: function (xhr, status, err) {
            console.log(err);
            message.classList.add('alert-danger');
            message.textContent = 'Извините, что-то пошло не так.';
            message.style.display = 'block';
        }
    });
};

function loadBase64(photo, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', function () {
        const base64 = reader.result.replace(/(\r\n|\n|\r)/gm, '');
        callback(base64);
    });
    reader.readAsDataURL(photo);
}
