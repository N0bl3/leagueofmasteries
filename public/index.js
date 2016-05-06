/*jshint browser:true, jquery:true*/

//si il y a un # dans l'url on ne peut pas rechercher un nouveau joueur
$(document).ready(function () {
    var playerId = options.playerId || "",
        playerName = options.playerName || "",
        region = options.region || "",
        playerScore;
        
    var friendCounter = 0;

        $.get(window.location.href + region + "/sname/" + playerName)
            .done(function () {
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
                        $("a.navbar-brand").text(playerName + " " + playerId);
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
            })
            .fail(function (error) {
                alert("Error! See console. F12 on Chrome");
                console.error(error);
            });

    
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
                friendCounter = 0;
                
                if (jqXHR.status == 200) {
                    console.log(data);
                    championName = data.championName;
                    championLevel = data.championLevel;
                    championPoints = data.championPoints;
                    highestGrade = data.highestGrade;
                    lastPlayTime = data.lastPlayTime;
                } else if (jqXHR.status == 204) {
                    console.error(jqXHR.status, textStatus);
                    $("#response-zone").text(jqXHR.status + " " + textStatus);
                }
            })
            .always(function (data, textStatus, jqXHR) {
                $.getJSON(window.location.href + region + "/champion/" + championId + "?friend=false")
                    .done(function (champion) {
                            
                        $("#response-zone").append("<div class='row'><div class='col-xs-4 col-xs-offset-4 friend-compare'>" +
                        "<p><img src='http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.key + "_0.jpg' alt='" + champion.name + "' class='top-img'><br><span id='champion-name'>" +
                        champion.name +
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
                            "Grade:<br><span id='champion-grade'>" +
                            (highestGrade || "None") +
                            "</span></p></div>");

                        
                        $("#response-zone").append("<div class='col-xs-5ths friend1'></div>");
                        
                        $("#response-zone").append("<div class='col-xs-5ths friend2'></div>");
                        
                        $("#response-zone").append("<div class='col-xs-5ths friend3'></div>");
                        
                        $("#response-zone").append("<div class='col-xs-5ths friend4'></div>");
                        
                        $("#response-zone").append("<div class='col-xs-5ths friend5'></div>");
                        
                        $("#friend-by-name").submit(function(event){
                            event.preventDefault();
                            
                            if (friendCounter < 4){
                            var counter = ++friendCounter;
                            var submission = $(this).serializeArray();
                            friendName = submission[0].value;
                            friendRegion = submission[1].value;
							$.getJSON(window.location.href + friendRegion + "/sname/" + friendName + "?friend=true")
                            .done(function (json) {
                                console.log(json);
                                json = json[friendName];
						        friendId = json.id;
								$.getJSON(window.location.href + region + "/pid/" + friendId + "/cid/" + championId)
					            .done(function (data, textStatus, jqXHR) {
					                if (jqXHR.status == 200) {
					                    console.log(data);
					                    championName = data.championName;
					                    championLevel = data.championLevel;
					                    championPoints = data.championPoints;
					                    highestGrade = data.highestGrade;
					                    lastPlayTime = data.lastPlayTime;
					                    $(".friend" + counter).append("<p>" +
                                            "Grade:<br><span id='champion-grade'>" +
                                            (highestGrade || "None") +
                                            "</span></p>");
					                } else if (jqXHR.status == 204) {
					                    console.error(jqXHR.status, textStatus);
					                    $(".friend" + counter).append(jqXHR.status + " " + textStatus);
					                }

					            });
                            });
                            } else {
                                alert("You reached the maximum amount of friends! Try reloading a new champ. A smoother interaction will be available soon.");
                            }
                        });
                    });
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
});