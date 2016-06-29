$(document).ready(function () {

  $('form#summ-by-name').submit(function (event) {
    event.preventDefault();
    var submission = $(this).serializeArray();
    var playerName = submission[0].value;
    var region = submission[1].value;

    playerName = playerName.trim().replace(/\s/g, "").toLowerCase();

    $('body').load("https://leagueofmasteries.eu-gb.mybluemix.net/" + region + "/sname/" + playerName);
  });
});
