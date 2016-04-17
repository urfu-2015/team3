$("#search").on("input", function () {
    $.ajax({
        type: "GET",
        url: "/search-word",
        data: {word: this.value},
        success: function (msg) {
            console.log("Данные:" + msg);
        }
    });
});

