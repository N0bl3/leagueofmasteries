/*jshint devel: true, node: true*/
var request = require('request');
var express = require('express');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');

var app = express();

var appEnv = cfenv.getAppEnv();
var api = "api_key=" + appEnv.app.RIOT_API;

var riotURL;
try {
    if (api) {
        var riotURL = "https://euw.api.pvp.net/api/lol/euw/v1.4/summoner/by-name/sp3cialk?" + api;

    } else {
        throw {
            message: "no API key"
        };

    }
} catch (e) {
    console.error(e.message);
}

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.get("/:location/:playerId/:championId", function (req, res) {
    request(riotURL + "/championmastery/location/" + req.params.location + "/player/" + req.params.playerId + "/champion/" + req.params.championId, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        } else {
            console.error(body);
        }
    });
});
// Runs the server
app.listen(appEnv.port, function () {

    console.log("server starting on " + appEnv.url);

});
