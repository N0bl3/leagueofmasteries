/*jshint browser:true, jquery:true*/

//si il y a un # dans l'url on ne peut pas rechercher un nouveau joueur
$(document).ready(function () {
    var playerId = options.playerId || "",
        playerName = options.playerName || "",
        playerDisplayedName = options.summonerName || "",
        region = options.region || "",
        playerScore;

    var friendCounter = 0;
    var progression, top, byChampion, byGameTeam;
    var champions = {};

    function renderProgression(arr) {
        $("#response-zone").text("");
        arr.forEach(function (champion) {
            $("#response-zone").append("<div class='col-xs-3'><p>" +
                "<img src='http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/" + champion.image.full + "' alt='" + champion.name + "'><br><span id='champion-name'>" +
                champion.name +
                "</span><br>Grade:Level<br><span id='champion-grade'>" +
                (champion.highestGrade || "None") + " : " + (champion.championLevel || 0) +
                "</span></p></div>");
        });
    }

    function renderTop(arr) {
        $("#response-zone").text("");
        arr.forEach(function (champion) {
            $("#response-zone").append("<div class='col-xs-3'><p>" +
                "<img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + champion.name + "' class='top-img'><br><span id='champion-name'>" +
                champion.name +
                "</span><br>Grade:<br><span id='champion-grade'>" +
                (champion.highestGrade || "None") +
                "</span></p></div>");
        });
    }

    function renderByChampion(championId, data, textStatus, jqXHR) {
        $("#response-zone").text("");
        friendCounter = 0;
        if (jqXHR) {
            if (jqXHR.status != 200) {
                console.log(data);
                console.error(jqXHR.status, textStatus);
                alert("No info for this champion");
                return false;
            }
            $.getJSON(window.location.href + region + "/champion/" + championId)
                .done(function (champion) {
                    champions[championId] = champion;
                    renderChampion(championId, data, champion);
                });
        } else {
            renderChampion(championId, data);
        }
    }

    function renderChampion(championId, data, champion) {
        if (!champion) {
            champion = champions[championId];
        }

        $("#response-zone").append("<div class='row'><div class='col-xs-4 col-xs-offset-4 friend-compare'>" +
            "<p><img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + data.championName + "' class='top-img'><br><span id='champion-name'>" +
            data.championName +
            "</span>" +
            "<br>Compare with a friend :</p>" +
            "<form id='friend-by-name'><div class='form-group'>" +
            "<input class='form-control' type='text' name='friend-name' placeholder='Search for a friend summoner'>" +
            "<select name='friend-region'>" +
            "<option value='euw'>EUW</option>" +
            "<option value='br'>BR</option>" +
            "<option value='eune'>EUNE</option>" +
            "<option value='na'>NA</option>" +
            "<option value='jp'>JP</option>" +
            "<option value='kr'>KR</option>" +
            "<option value='lan'>LAN</option>" +
            "<option value='las'>LAS</option>" +
            "<option value='oce'>OCE</option>" +
            "<option value='ru'>RU</option>" +
            "<option value='tr'>TR</option></select>" +
            "<button class='btn btn-default' type='submit'>Search</button></div></div></div>");

        $("#response-zone").append("<div class='col-xs-5ths friend0'><p>" +
            playerDisplayedName +
            "<br>Level : " + data.championLevel +
            "<br>Points : " + data.championPoints +
            "<br>Grade : <span id='champion-grade'>" +
            (data.highestGrade || "None") +
            "</span></p></div>");


        $("#response-zone").append("<div class='col-xs-5ths friend1'></div>");

        $("#response-zone").append("<div class='col-xs-5ths friend2'></div>");

        $("#response-zone").append("<div class='col-xs-5ths friend3'></div>");

        $("#response-zone").append("<div class='col-xs-5ths friend4'></div>");

        $("#response-zone").append("<div class='col-xs-5ths friend5'></div>");

        $("#friend-by-name").submit(function (event) {
            event.preventDefault();

            if (friendCounter < 4) {
                var submission = $(this).serializeArray();
                friendCounter++;
                renderFriendChampion(championId, friendCounter, submission[0].value, submission[1].value);
            } else {
                alert("You reached the maximum amount of friends! Try reloading a new champ. A smoother interaction will be available soon.");
            }
        });
    }

    function renderFriendChampion(championId, friendPosition, friendName, friendRegion) {
        $.getJSON(window.location.href + friendRegion + "/sname/" + friendName + "?friend=true")
            .done(function (json, textStatus, jqXHR) {
                if (jqXHR.status != 404) {
                    console.log(json);
                    json = json[friendName];
                    var friendId = json.id;
                    $.getJSON(window.location.href + region + "/pid/" + friendId + "/cid/" + championId)
                        .done(function (data, textStatus, jqXHR) {
                            if (jqXHR.status == 200) {
                                console.log(data);
                                var championLevel = data.championLevel;
                                var championPoints = data.championPoints;
                                var highestGrade = data.highestGrade;
                                //                                        var lastPlayTime = data.lastPlayTime;
                                $(".friend" + friendPosition).append("<p>" +
                                    json.name +
                                    "<br>Level : " + championLevel +
                                    "<br>Points : " + championPoints +
                                    "<br>Grade : <span id='champion-grade'>" +
                                    (highestGrade || "None") +
                                    "</span></p>");
                            } else if (jqXHR.status == 204) {
                                console.error(jqXHR.status, textStatus);
                                $(".friend" + friendPosition).append(jqXHR.status + " " + textStatus);
                            }
                        });
                } else {
                    console.error(jqXHR.status + " " + textStatus);
                }
            });
    }

    function renderByGameTeam(players, player) {
        return (function () {
            var counter = player;

            $.getJSON(window.location.href + region + "/champion/" + players[counter].championId)
                .done(function (champion) {
                    var championName = champion.name;
                    $.getJSON(window.location.href + region + "/pid/" + players[counter].summonerId + "/cid/" + players[counter].championId)
                        .done(function (data, textStatus, jqXHR) {
                            if (jqXHR.status == 200 || jqXHR.status == 204) {
                                console.log(data);
                                var championLevel = data ? data.championLevel : "None";
                                var championPoints = data ? data.championPoints : "None";
                                var highestGrade = data ? data.highestGrade : "None";
                                //                                var lastPlayTime = data.lastPlayTime;
                                var str = "<div class='col-xs-5ths friend" + counter + "'><p>" +
                                    players[counter].summonerName +
                                    "<p><img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + championName + "' class='top-img'>" + championName +
                                    "<br>Level : " + championLevel +
                                    "<br>Points:" + championPoints +
                                    "<br>Grade : " + highestGrade +
                                    "</p>" +
                                    "</div>";
                                if (players[counter].teamId == 100) {
                                    $(".red-side").append(str);
                                } else if (players[counter].teamId == 200) {
                                    $(".blue-side").append(str);
                                }
                                console.log(jqXHR.status, textStatus);
                            } else {
                                console.error(jqXHR.status, textStatus);
                            }
                        });
                });
        })();
    }

    function renderRecommendedChampion(region, playerId){
        $.getJSON(window.location.href + region + "/pid/" + playerId + "/recommended")
        .done(function(data){
            var specialist = data.specialist;
            var nemesis = data.nemesis;
            $("#recommended").append("<div class='col-xs-12'><p>Best champions to get next :</div>" + 
            "<div class='text-center col-xs-12 col-md-3'><p>Become a specialist with a " + data.best + " " + data.secondBest + "</p></div>" + 
            "<div class='text-center col-xs-12 col-md-3'><p><img src='http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/" + specialist.image.full + "' alt='" + specialist.name + "'></p></div>" + 
            "<div class='text-center col-xs-12 col-md-3'><p><img src='http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/" + nemesis.image.full + "' alt='" + nemesis.name + "'></p></div>" + 
            "<div class='text-center col-xs-12 col-md-3'><p>Or become polyvalent with a " + nemesis.tags[0] + " " + (nemesis.tags[1] || ".") + "</p></div>");
        });
    }

    $("#response-zone").text("");
    $("#response-zone").append("<h3>ID: " + playerId + " - " + playerName + "</h3>");
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

            $("#player-score").append("<h4>Mastery score : " + playerScore + "/650</h4>")
                .append('<div class="progress">' +
                    '<div class="progress-bar ' + progressClass + '" role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + percentage + '%;">' +
                    '<span class="sr-only">' + percentage + '% Complete</span>' +
                    '</div></div>');
        });
    $(".nav>li>a").removeAttr("disabled");

    $.getJSON(window.location.href + region + "/pid/" + playerId + "/champions")
        .done(function (arr) {
            progression = arr;
            renderProgression(arr);
        });

    renderRecommendedChampion(region, playerId);

    $("form#summ-by-name").submit(function (event) {
        event.preventDefault();
        var submission = $(this).serializeArray();
        playerName = submission[0].value;
        region = submission[1].value;
        $("body").load(window.location.href + region + "/sname/" + playerName);
    });

    $("#progression-button").click(function (event) {
        event.preventDefault();
        if (!progression) {
            $.getJSON(window.location.href + region + "/pid/" + playerId + "/champions")
                .done(function (arr) {
                    progression = arr;
                    renderProgression(arr);
                });
        } else {
            renderProgression(progression);
        }
    });

    $("#get-top-ten").click(function (event) {
        event.preventDefault();
        if (!top) {
            $.getJSON(window.location.href + region + "/pid/" + playerId + "/top?count=12")
                .done(function (arr) {
                    top = arr;
                    renderTop(arr);
                });
        } else {
            renderTop(top);
        }
    });

    $("form#by-champion").submit(function (event) {
        event.preventDefault();

        var submission = $(this).serializeArray();
        var championId = submission[0].value;
        if (championId != 0 && (!byChampion || byChampion.championId != championId)) {
            console.info(championId);
            console.log(byChampion);
            $.getJSON(window.location.href + region + "/pid/" + playerId + "/cid/" + championId)
                .done(function (data, textStatus, jqXHR) {
                    byChampion = data;
                    renderByChampion(championId, data, textStatus, jqXHR);
                });
        } else if (championId == 0) {
            alert("Choose a champion");
            console.warn("Choose a champion");
        } else {
            renderByChampion(championId, byChampion);
        }
    });

    $("#get-game-team-mastery").click(function (event) {
        event.preventDefault();
        $("#response-zone").text("");
        if (!byGameTeam) {
            $.getJSON(window.location.href + region + "/pid/" + playerId + "/game-team")
                .done(function (players, textStatus, jqXHR) {

                    if(jqXHR.status == 200){
                    byGameTeam = players;
                    console.log(players);

                    $("#response-zone").append("<div class='row blue-side'></div>");
                    $("#response-zone").append("<div class='row red-side'></div>");

                    var player;
                    for (var player in players) {
                        renderByGameTeam(players, player);
                    }
                    } else {
                        console.error(jqHXR.status, textStatus);
                    }
                })
                .fail(function(error){
                    console.error(error.status, error.responseText, error);
                    $("#response-zone").text("The player is probably not in game or the game's info are not available yet. If you are sure about it, try again in a minute. See console for details.");
                });
        } else {
            var player;
            for (player in byGameTeam) {
                renderByGameTeam(byGameTeam, player);
            }
        }
    });

    $("#leaderboards-button").click(function (event) {
        event.preventDefault();
    });
});
