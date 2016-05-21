var searchField = document.getElementById('search-input');
var container = document.querySelector('.container-fluid');
var sortButton = document.getElementById('sort-button');
var load = document.querySelector('.load');
var latitude;
var longitude;
var value = 'default';

$('#search-button').click(function () {
    load.classList.remove('load_invisible');
    container.classList.add('container-fluid_shift');
    value = searchField.value ? searchField.value : 'default';
    $.ajax({
        type: "GET",
        url: "/quests",
        data: {
            word: value
        },
        success: function (data) {
            load.classList.add('load_invisible');
            container.classList.remove('container-fluid_shift');
            container.innerHTML = data;
        }
    });
});

$('#sort-button').click(function () {
    load.classList.remove('load_invisible');
    container.classList.add('container-fluid_shift');
    sendRequest();
});

sortButton.addEventListener('touchstart', function (event) {
    event.preventDefault();
    event.stopPropagation();
    load.classList.remove('load_invisible');
    container.classList.add('container-fluid_shift');
    sendRequest();
}, false);

function sendRequest() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            $.ajax({
                type: "GET",
                url: "/quests",
                data: {
                    word: value,
                    latitude: JSON.stringify(latitude),
                    longitude: JSON.stringify(longitude)
                },
                success: function (data) {
                    load.classList.add('load_invisible');
                    container.classList.remove('container-fluid_shift');
                    container.innerHTML = data;
                }
            });
        });
    }
}
