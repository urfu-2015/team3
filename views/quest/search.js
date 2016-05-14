$("#quest-city").autocomplete({
    source: function(request, response) {
        $.ajax({
            type: "GET",
            url: "/search/cities",
            data: {word: request.term},
            success: function (data) {
                response(data);
            }
        });
    },
    minLength: 1
});

$("#quest-tags").autocomplete({
    source: function(request, response) {
        var term = request.term;
        var lastSpaceIndex = term.lastIndexOf(' ');
        if (lastSpaceIndex !== -1) {
            term = term.substring(lastSpaceIndex + 1, term.length);
        }
        $.ajax({
            type: "GET",
            url: "/search/tags",
            data: {word: term},
            success: function (data) {
                response(data);
            }
        });
    },
    select: function(event, ui) {
        var values = $("#quest-tags").val();
        if (values.indexOf(ui.item.value) === -1) {
            var lastSpaceIndex = values.lastIndexOf(' ');
            if (lastSpaceIndex === -1) {
                $("#quest-tags").val(ui.item.value);
            } else {
                values = values.substring(0, lastSpaceIndex) + ', ' + ui.item.value;
                $("#quest-tags").val(values);
            }
        }
        return false;
    },
    focus: function(event, ui) {
        return false;
    },
    minLength: 1
});
