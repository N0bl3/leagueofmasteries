/*jshint browser:true, jquery:true*/

//si il y a un # dans l'url on ne peut pas rechercher un nouveau joueur
$(document).ready(function () {
    var playerId = options.playerId || "",
        playerName = options.playerName || "",
        region = options.region || "",
        playerScore;

    $("#response-zone").append("<h3>ID: " + playerId + " - " + playerName + "</h3>");

    $("form#summ-by-name").submit(function (event) {
        event.preventDefault();
        var submission = $(this).serializeArray();
        playerName = submission[0].value;
        region = submission[1].value;
        $.getJSON(window.location.href + region + "/sname/" + playerName)
            .done(function (json) {
                playerId = json.id;
                $("#response-zone").text("");
                $("#response-zone").append("<p><img src='http://ddragon.leagueoflegends.com/cdn/6.8.1/img/profileicon/" + json.profileIconId + ".png'></p><h3>ID: " + playerId + " - " + playerName + "</h3><h4>Level: " + json.summonerLevel + "</h4>");
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
                        $("a.navbar-brand").text(playerId);
                        $("#player-score").append("<h4>Total score : " + playerScore + "</h4>")
                            .append('<div class="progress">' +
                                '<div class="progress-bar ' + progressClass + '" role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + percentage + '%;">' +
                                '<span class="sr-only">' + percentage + '% Complete</span>' +
                                '</div></div>')
                            .append("<div class='col-xs-12'><p>" +
                                "You have " + playerScore + "/650 to get all champs at max level" +
                                "</p></div>");
                    });
                $(".nav>li>a").removeAttr("disabled");
            });
    });

    $("#get-game-team-mastery").click(function (event) {
        event.preventDefault();
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/game-team")
            .done(function (participants) {
                console.log(participants);
            });
    });

    $("#leaderboards-button").click(function (event) {
        event.preventDefault();
    });

    $("#progression-button").click(function (event) {
        event.preventDefault();
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/champions")
            .done(function (arr) {
                $("#response-zone").text("");
                arr.forEach(function (champion) {
                    $("#response-zone").append("<div class='col-xs-3'><p>" +
                        "<img src='http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/" + champion.image.full + "' alt='" + champion.name + "'><br><span id='champion-name'>" +
                        champion.name +
                        "</span><br>Grade:Level<br><span id='champion-grade'>" +
                        (champion.highestGrade || "None") + " : " + (champion.championLevel || 0) +
                        "</span></p></div>");
                });
            });
    });

    $("#get-top-ten").click(function (event) {
        event.preventDefault();
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/top?count=12")
            .done(function (arr) {
                $("#response-zone").text("");
                arr.forEach(function (champion) {
                    $("#response-zone").append("<div class='col-xs-3'><p>" +
                        "<img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + champion.name + "' class='top-img'><br><span id='champion-name'>" +
                        champion.name +
                        "</span><br>Grade:<br><span id='champion-grade'>" +
                        (champion.highestGrade || "None") +
                        "</span></p></div>");
                });
            });
    });

    $("form#by-champion").submit(function (event) {
        event.preventDefault();
        var submission = $(this).serializeArray();
        var championId = submission[0].value;
        var championName = "",
            championLevel = "",
            championPoints = "",
            highestGrade = "",
            lastPlayTime = "";
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/cid/" + championId)
            .done(function (data, textStatus, jqXHR) {
                $("#response-zone").text("");
                if (jqXHR.status == 200) {
                    console.log(data);
                    championName = data.championName;
                    championLevel = data.championLevel;
                    championPoints = data.championPoints;
                    highestGrade = data.highestGrade;
                    lastPlayTime = data.lastPlayTime;
                    //				not dev
                    $("form#compare-champ-with-friend").submit(function (event) {
                        event.preventDefault();
                        var submission = $(this).serializeArray();
                        var friendName = submission[0].value;
                        var friendRegion = submission[1].value;
                        $.getJSON(window.location.href + friendRegion + "/sname/" + friendName);
                    });
                } else if (jqXHR.status == 204) {
                    console.error(jqXHR.status, textStatus);
                    $("#response-zone").text(jqXHR.status + " " + textStatus);
                }
            })
            .always(function (data, textStatus, jqXHR) {
                $.getJSON(window.location.href + region + "/champion/" + championId)
                    .done(function (champion) {
                        $("#response-zone").append("<div class='col-xs-12'><p>" +
                            "<img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + champion.name + "' class='top-img'><br><span id='champion-name'>" +
                            champion.name +
                            "</span><br>Grade:<br><span id='champion-grade'>" +
                            (champion.highestGrade || "None") +
                            "</span></p></div>");
                    });
            });
    });
});