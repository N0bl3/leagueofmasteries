/*jshint browser:true, jquery:true*/

$(document).ready(function () {
    var playerId = options.playerId || "",
        playerName = options.playerName || "",
        playerDisplayedName = options.summonerName || "",
        region = options.region || "",
        gameVersion = options.version || "",
        playerIconId = options.playerIconId || "",
        playerScore;

    var friendCounter = 0;
    var progression, top, byChampion, byGameTeam;
    var champions = {};

    function renderProgression(arr, sortBy) {
        var str;
        $("#response-zone").text("");

        if (sortBy === "grade") {
            str = "<div class='col-xs-12'>" +
                "<button id='by-score' type='button'>By Score</button>" +
                "<button id='by-grade' type='button'>By Grade</button>" +
                "</div>" +
                "<div class='row text-center grade s-grade'><div class='col-xs-12'><h3>Grade S</h3></div></div><div class='row text-center grade a-grade'><div class='col-xs-12'><h3>Grade A</h3></div></div><div class='row text-center grade b-grade'><div class='col-xs-12'><h3>Grade B</h3></div></div><div class='row text-center grade c-grade'><div class='col-xs-12'><h3>Grade C</h3></div></div><div class='row grade d-grade'><div class='col-xs-12'><h3>Grade D</h3></div></div><div class='row text-center grade no-grade'><div class='col-xs-12'><h3>No Grade</h3></div></div>";
        } else if (sortBy === "score") {
            str = "<div class='col-xs-12'>" +
                "<button id='by-score' type='button'>By Score</button>" +
                "<button id='by-grade' type='button'>By Grade</button>" +
                "</div>" +
                "<div class='row text-center level level-5'><div class='col-xs-12'><h3>Level 5</h3></div></div><div class='row text-center level level-4'><div class='col-xs-12'><h3>Level 4</h3></div></div><div class='row text-center level level-3'><div class='col-xs-12'><h3>Level 3</h3></div></div><div class='row text-center level level-2'><div class='col-xs-12'><h3>Level 2</h3></div></div><div class='row level level-1'><div class='col-xs-12'><h3>Level 1</h3></div></div>";
        }
        $("#response-zone").append(str);

        arr.forEach(function (champion) {

            champion.intGrade = gradeToInt(champion.highestGrade);
            champion.smallGrade = champion.highestGrade ? champion.highestGrade.replace(/\W/g, "").toLowerCase() : 'no';
            console.log(champion.championLevel);
            if (sortBy === "grade") {
                $("." + champion.smallGrade + "-grade").append("<div class='col-xs-3'><p>" +
                    "<img src='http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/champion/" + champion.image.full + "' alt='" + champion.name + "'><br><span id='champion-name'>" +
                    champion.name +
                    "</span><br>Grade : Level<br><span id='champion-grade'>" +
                    (champion.highestGrade || "None") + " : " + (champion.championLevel || 0) +
                    "</span><br>Score : " + champion.championPoints +
                    "</p></div>");
            } else if (sortBy === "score") {
                $(".level-" + champion.championLevel).append("<div class='col-xs-3'><p>" +
                    "<img src='http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/champion/" + champion.image.full + "' alt='" + champion.name + "'><br><span id='champion-name'>" +
                    champion.name +
                    "</span><br>Grade : Level<br><span id='champion-grade'>" +
                    (champion.highestGrade || "None") + " : " + (champion.championLevel || 0) +
                    "</span><br>Score : " + champion.championPoints +
                    "</p></div>");
            }

        });

        $("#by-grade").click(function (e) {
            e.preventDefault();
            var gradeArr = [],
                sortingArr = [];
            progression.forEach(function (champion) {
                sortingArr.push([champion, champion.intGrade]);
            });
            sortingArr.sort(function (a, b) {
                return b[1] - a[1];
            });
            for (var i = 0; i < sortingArr.length; i++) {
                gradeArr.push(sortingArr[i][0]);
            }
            renderProgression(gradeArr, "grade");
        });
        $("#by-score").click(function (e) {
            e.preventDefault();
            renderProgression(progression, "score");
        });
    }

    function renderTop(arr) {
        $("#response-zone").text("");
        $("#response-zone").append("<div class='col-xs-12'>" +
            "<button id='by-score' type='button'>By Score</button>" +
            "<button id='by-grade' type='button'>By Grade</button>" +
            "</div>");
        $("#response-zone").append("<div class='row text-center top-first'></div>");
        $("#response-zone").append("<div class='row text-center top-second'></div>");
        $("#response-zone").append("<div class='row text-center top-third'></div>");

        arr.forEach(function (champion, index) {
            var str = "<div class='col-xs-3'><p>" +
                "<span class='hidden-xs hidden-sm'><img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + champion.name + "' class='top-img'></span>" +
                "<span class='hidden-md hidden-lg'><img src='http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/champion/" + champion.image.full + "' alt='" + champion.name + "'></span><br><span id='champion-name'>" +
                champion.name +
                "</span>" +
                "<br>Score : " + champion.championPoints +
                "<br>Grade : <span id='champion-grade'>" +
                (champion.highestGrade || "None") +
                "</span></p></div>";
            if (index < 4) {
                $(".top-first").append(str);
            } else if (index < 8) {
                $(".top-second").append(str);
            } else {
                $(".top-third").append(str);
            }
        });
        $("#by-grade").click(function (e) {
            e.preventDefault();
            var gradeArr = [],
                sortingArr = [];
            top.forEach(function (champion) {
                sortingArr.push([champion, champion.intGrade]);
            });
            sortingArr.sort(function (a, b) {
                return b[1] - a[1];
            });
            for (var i = 0; i < sortingArr.length; i++) {
                gradeArr.push(sortingArr[i][0]);
            }
            renderTop(gradeArr);
        });
        $("#by-score").click(function (e) {
            e.preventDefault();
            renderTop(top);
        });
    }

    function renderByChampion(championId, data, textStatus, jqXHR) {
        $("#response-zone").text("");
        friendCounter = 0;
        if (jqXHR) {
            if (jqXHR.status != 200) {
                console.log(data);
                console.error(jqXHR.status, textStatus);
                alert("No info for this champion and this summoner");
                return false;
            }
            $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/champion/" + championId)
                .done(function (champion) {
                    champions[championId] = champion;
                    renderChampion(championId, data, champion);
                });
        } else {
            renderChampion(championId, data);
        }
    }

    function renderChampion(championId, data, champion) {
        if (champion) {
            champion = champions[championId];

            $("#response-zone").append("<div class='row'><div class='col-xs-3 me'></div><div class='col-xs-3 friend-compare'>" +
                "<p><img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + data.championName + "' class='top-img'><br><span id='champion-name'>" +
                data.championName +
                "</span>, " + champion.title +
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
                "<button class='btn btn-default' type='submit'>Search</button>" +
                "<button class='btn btn-default' type='reset' value='Reset'>Reset</button>" +
                "</div></form></div><div class='col-xs-6 friend-list'></div></div>");
        }
        var str;
        if (data) {
            str = "<p><img src='http://ddragon.leagueoflegends.com/cdn/6.9.1/img/profileicon/" + playerIconId + ".png' width='30' height='30'> " +
                playerDisplayedName +
                "<br>Level : " + data.championLevel +
                "<br>Points : " + data.championPoints +
                "<br>Grade : <span id='champion-grade'>" +
                (data.highestGrade || "None") +
                "</span></p>";
        } else {
            str = "<p>" +
                playerDisplayedName +
                "<br>No score</p>";
        }
        $(".me").append(str);

        $("#friend-by-name").submit(function (event) {
            event.preventDefault();

            if (friendCounter < 6) {
                var submission = $(this).serializeArray();
                var friendName = submission[0].value.trim().replace(/\s/g, "").toLowerCase();
                friendCounter++;
                renderFriendChampion(championId, friendCounter, friendName, submission[1].value);
            } else {
                alert("You reached the maximum amount of friends! Click reset or try a new champ.");
            }
        });
        $("#friend-by-name").on("reset", function (event) {
            event.preventDefault();
            $(".friend-list").text("");
            friendCounter = 0;
        });
    }

    function renderFriendChampion(championId, friendPosition, friendName, friendRegion) {
        $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + friendRegion + "/sname/" + friendName + "?friend=true")
            .done(function (json, textStatus, jqXHR) {
                if (jqXHR.status != 404) {
                    console.log(json);
                    json = json[friendName];
                    var friendId = json.id;
                    $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + friendId + "/cid/" + championId)
                        .done(function (data, textStatus, jqXHR) {
                            if (jqXHR.status == 200) {
                                console.log(data);
                                var championLevel = data.championLevel;
                                var championPoints = data.championPoints;
                                var highestGrade = data.highestGrade;
                                //                                        var lastPlayTime = data.lastPlayTime;
                                $(".friend-list").append("<div class='col-xs-12'><p>" +
                                    "<img src='http://ddragon.leagueoflegends.com/cdn/6.9.1/img/profileicon/" + json.profileIconId + ".png' width='30' height='30'> " +
                                    json.name +
                                    "<br>Level : " + championLevel +
                                    "<br>Points : " + championPoints +
                                    "<br>Grade : <span id='champion-grade'>" +
                                    (highestGrade || "None") +
                                    "</span></p></div>");
                            } else if (jqXHR.status == 204) {
                                console.error(jqXHR.status, textStatus);
                                console.log(jqXHR);
                                $(".friend-list").append("<div class='col-xs-12'><p><img src='http://ddragon.leagueoflegends.com/cdn/6.9.1/img/profileicon/" + json.profileIconId + ".png' width='30' height='30'> " + json.name +
                                    "<br>No data</p></div>");
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

            $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/champion/" + players[counter].championId)
                .done(function (champion) {
                    var championName = champion.name;
                    var championTitle = champion.title;
                    $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + players[counter].summonerId + "/cid/" + players[counter].championId)
                        .done(function (data, textStatus, jqXHR) {
                            if (jqXHR.status == 200 || jqXHR.status == 204) {
                                console.log(data || "No mastery data found");
                                var championLevel = data ? data.championLevel : "None";
                                var championPoints = data ? data.championPoints : "None";
                                var highestGrade = data ? data.highestGrade : "None";
                                var str = "<div class='col-xs-5ths friend" + counter + "'><p>" +
                                    players[counter].summonerName +
                                    "<p><span class='hidden-xs hidden-sm'><img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + championName + "' class='top-img'></span>" +
                                    "<span class='hidden-md hidden-lg'><img src='http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/champion/" + champion.image.full + "' alt='" + champion.name + "'></span>" +
                                    "<br>" + championName + "<span class='hidden-xs hidden-sm'>, " + championTitle + "</span>" +
                                    "<br>Level : " + championLevel +
                                    "<br>Points : " + championPoints +
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

    function renderRecommendedChampion(region, playerId) {
        $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId + "/recommended")
            .done(function (data) {
                var specialist = data.specialist;
                var nemesis = data.nemesis;
                $("#recommended").append("<div class='col-xs-12'><p>Best champions to get next :</div>" +
                    "<div class='text-center col-xs-12 col-md-3'><p>Become a specialist with a " + data.best + " " + data.secondBest + "</p></div>" +
                    "<div class='text-center col-xs-12 col-md-3'><p><img src='http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/champion/" + specialist.image.full + "' alt='" + specialist.name + "'></p></div>" +
                    "<div class='text-center col-xs-12 col-md-3'><p><img src='http://ddragon.leagueoflegends.com/cdn/" + gameVersion + "/img/champion/" + nemesis.image.full + "' alt='" + nemesis.name + "'></p></div>" +
                    "<div class='text-center col-xs-12 col-md-3'><p>Or become polyvalent with a " + nemesis.tags[0] + " " + (nemesis.tags[1] || "") + "</p></div>");
            });
    }

    function gradeToInt(grade) {
        switch (grade) {
            case 'D-':
                return 1;
            case 'D':
                return 2;
            case 'D+':
                return 3;
            case 'C-':
                return 4;
            case 'C':
                return 5;
            case 'C+':
                return 6;
            case 'B-':
                return 7;
            case 'B':
                return 8;
            case 'B+':
                return 9;
            case 'A-':
                return 10;
            case 'A':
                return 11;
            case 'A+':
                return 12;
            case 'S-':
                return 13;
            case 'S':
                return 14;
            case 'S+':
                return 15;
            default:
                return 0;
        }
    }

    $("#response-zone").text("");
    $("#response-zone").append("<h3>ID: " + playerId + " - " + playerName + "</h3>");
    $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId)
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

    $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId + "/champions")
        .done(function (arr) {
            progression = arr;
            progression.forEach(function (champion) {
                champion.intGrade = gradeToInt(champion.highestGrade);
            });
            renderProgression(progression, "score");
        });

    renderRecommendedChampion(region, playerId);

    $("form#summ-by-name").submit(function (event) {
        event.preventDefault();
        var submission = $(this).serializeArray();
        playerName = submission[0].value;
        region = submission[1].value;

        playerName = playerName.trim().replace(/\s/g, "").toLowerCase();

        $("body").load("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/sname/" + playerName);
    });

    $("#progression-button").click(function (event) {
        event.preventDefault();
        if (!progression) {
            $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId + "/champions")
                .done(function (arr) {
                    progression = arr;
                    renderProgression(arr, "score");
                });
        } else {
            renderProgression(progression, "score");
        }
    });

    $("#get-top-ten").click(function (event) {
        event.preventDefault();
        if (!top) {
            $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId + "/top?count=12")
                .done(function (arr) {
                    top = arr;
                    renderTop(top);
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
            $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId + "/cid/" + championId)
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
        $.getJSON("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/pid/" + playerId + "/game-team")
            .done(function (players, textStatus, jqXHR) {

                if (jqXHR.status == 200) {
                    byGameTeam = players;
                    console.log(players);

                    $("#response-zone").append("<div class='row blue-side'></div>");
                    $("#response-zone").append("<div class='row red-side'></div>");

                    var player;
                    for (var player in players) {
                        renderByGameTeam(players, player);
                    }
                } else {
                    console.error(jqXHR.status, textStatus);
                }
            })
            .fail(function (error) {
                console.error(error.status, error.responseText, error);
                $("#response-zone").text("The player is probably not in game or the game's info are not available yet. If you are sure about it, try again in a minute. See console for details.");
            });
    });

    $("#quizz-button").click(function (event) {
        var masteredChampions = progression.filter(function (champion) {
            if (/^s[\+\-]?$/i.test(champion.highestGrade)) {
                return true;
            }
        });
        var quizzChampion = masteredChampions[Math.floor(Math.random() * masteredChampions.length)].id;
        $("#response-zone").text("Under Development<br>quizzChampion");
        //        $("#response-zone").load("https://leagueofmasteries.eu-gb.mybluemix.net/render/quizz/cid/" + quizzChampion + "/S");
    });

    $("#leaderboards-button").click(function (event) {
        event.preventDefault();
        alert("This is in development!");
    });
});
