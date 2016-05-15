$('#search-button').click(function () {
    var searchField = document.getElementById('search-input');
    var value = searchField.value ? searchField.value : 'default';
    $.ajax({
        type: "GET",
        url: "/quests",
        data: {
            word: value
        },
        success: function (data) {
            var container = document.querySelector('.container-fluid');
            container.innerHTML = data;
        }
    });
});
