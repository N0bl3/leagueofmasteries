/*jshint browser:true, jquery:true*/
$(document).ready(function () {
    var playerId,
        playerName,
        region,
        playerScore;

    $("form#summ-by-name").submit(function (event) {
        event.preventDefault();
        var submission = $(this).serializeArray();

        playerName = submission[0].value;
        region = submission[1].value;
        $.getJSON(window.location.href + region + "/sname/" + playerName)
            .done(function (json) {
                $("#response-zone").text("");
                $("#top-zone").text("");
                $("#progression-zone").text("");
                $("#response-zone").append("<p>profileIconId : " + json.profileIconId + "</p><h3>ID: " + json.id + " - " + json.name + "</h3><h4>Level: " + json.summonerLevel + "</h4>");
                playerId = json.id;
            })
            .then(function () {
                $.getJSON(window.location.href + region + "/pid/" + playerId)
                    .done(function (score) {
                        $("#player-score").text("");
                        playerScore = score;
                    })
                    .then(function () {
                        var percentage = playerScore * 100 / (130 * 5);
                        var progressClass;
                        if (percentage <= 25) {
                            progressClass = "progress-bar-danger";
                        } else if (percentage > 25 && percentage <= 50) {
                            progressClass = "progress-bar-warning";
                        } else if (percentage > 50 && percentage <= 75) {
                            progressClass = "progress-bar-info";
                        } else {
                            progressClass = "progress-bar-success";
                        }
                        $("#player-score").append("<h4>Total score : " + playerScore + "</h4>")
                            .append('<div class="progress">' +
                                '<div class="progress-bar ' + progressClass + '" role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + percentage + '%;">' +
                                '<span class="sr-only">' + percentage + '% Complete</span>' +
                                '</div></div>')
                            .append("<div class='col-xs-12'><p>" +
                                "You have " + playerScore + "/650 to get all champs at max level" +
                                "</p></div>");
                    });
                $("button").removeAttr("disabled");
            });

    });

    $("button#leaderboards-button").click(function () {
        $.getJSON("")
            .done(function () {});
    });

    $("button#progression-button").click(function () {
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/champions")
            .done(function (arr) {
                $("#top-zone").text("");
                $("#progression-zone").text("");
                arr.forEach(function (champion) {
                    $("#progression-zone").append("<div class='col-xs-3'><p>" +
                        "<img src='http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/" + champion.image.full + "' alt='" + champion.name + "'><br><span id='champion-name'>" +
                        champion.name +
                        "</span><br>Grade:Level<br><span id='champion-grade'>" +
                        (champion.highestGrade || "None") + " : " + (champion.championLevel || 0) +
                        "</span></p></div>");
                });
            });
    });

    $("button#get-top-ten").click(function () {
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/top?count=12")
            .done(function (arr) {
                $("#progression-zone").text("");
                $("#top-zone").text("");
                arr.forEach(function (champion) {
                    $("#top-zone").append("<div class='col-xs-3'><p>" +
                        "<img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + champion.name + "' class='top-img'><br><span id='champion-name'>" +
                        champion.name +
                        "</span><br>Grade:<br><span id='champion-grade'>" +
                        (champion.highestGrade || "None") +
                        "</span></p></div>");
                });
            });
    });
});
