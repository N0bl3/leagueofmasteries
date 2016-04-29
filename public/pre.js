$(document).ready(function(){

    $("form#summ-by-name").submit(function (event) {
        event.preventDefault();
        var submission = $(this).serializeArray();
        var playerName = submission[0].value;
        var region = submission[1].value;
        $("body").load(window.location.href + region + "/sname/" + playerName);
    });
});