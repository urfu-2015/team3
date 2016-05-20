var searchField = document.getElementById('search-input');
var container = document.querySelector('.container-fluid');
var latitude;
var longitude;
var value = 'default';

$('#search-button').click(function () {
    value = searchField.value ? searchField.value : 'default';
    $.ajax({
        type: "GET",
        url: "/quests",
        data: {
            word: value
        },
        success: function (data) {
            container.innerHTML = data;
        }
    });
});

$('#sort-button').click(function () {
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
                    container.innerHTML = data;
                }
            });
        });
    }
});
