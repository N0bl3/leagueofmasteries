/*jshint esnext: true, devel: true, node: true*/
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
        var riotURL = "https://euw.api.pvp.net/api/lol";
    } else {
        throw new Error("no API key");
    }
} catch (e) {
    console.error(e.name + ":" + e.message);
}

app.use(express.static(__dirname + '/views'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.get("/", function (req, res) {
    res.end("index.html");
});
app.get("/:region/:summonerName", function (req, res) {
    var sName = req.params.summonerName;
    request({
        url: riotURL + "/" + req.params.region + "/v1.4/summoner/by-name/" + sName + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body[sName]);
            res.end(body);
        } else {
            console.error("Error at endpoint : /:region/:summonerName\nStatus Code : " + response.statusCode);
        }
    });
});
app.get("/:region/:summId/masteries", function (req, res) {
    request({
        url: riotURL + "/" + req.params.region + "/v1.4/summoner/" + req.params.summId + "/masteries?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body[req.params.summId]);
            res.end(body);
        } else {
            console.error("Error! " + JSON.stringify(body));
        }
    });
});
// Runs the server
app.listen(appEnv.port, function () {

    console.log("server starting on " + appEnv.url);

});
