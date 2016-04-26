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
//Get summoner info from his name and location
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
//Get mastery book for a summoner
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
//Get a champion mastery by player id and champion id. Response code 204 means there were no masteries found for given player id or player id and champion id combination. (RPC)
app.get("/:platformId/:playerId/:championId", function (req, res) {
    request({
        url: riotURL + "/championmastery/location/" + req.params.platformId + "/player/" + req.params.playerId + "/champion/" + req.params.championId + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body);
            res.end(body);
        } else {
            console.error("Error at endpoint : /:platformId/:playerId/:championId\nStatus Code : " + response.statusCode);
        }
    });
});
//Get all champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:platformId/:playerId/champions", function (req, res) {
    request({
        url: riotURL + "/championmastery/location/" + req.params.platformId + "/player/" + req.params.playerId + "/champions" + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body);
            res.end(body);
        } else {
            console.error("Error at endpoint : /:platformId/:playerId/champions\nStatus Code : " + response.statusCode);
        }
    });
});
//Get a player's total champion mastery score, which is sum of individual champion mastery levels (RPC)
app.get("/:platformId/:playerId", function (req, res) {
    request({
        url: riotURL + "/championmastery/location/" + req.params.platformId + "/player/" + req.params.playerId + "/score" + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body);
            res.end(body);
        } else {
            console.error("Error at endpoint : /:platformId/:playerId\nStatus Code : " + response.statusCode);
        }
    });
});
//Get specified number of top champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:platformId/:playerId/top", function (req, res) {
    request({
        url: riotURL + "/championmastery/location/" + req.paramsplatformId + "/player/" + req.paramsplayerId + "/topchampions" + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body);
            res.end(body);
        } else {
            console.error("Error at endpoint : /:platformId/:playerId/top\nStatus Code : " + response.statusCode);
        }
    });
});
// Runs the server
app.listen(appEnv.port, function () {

    console.log("server starting on " + appEnv.url);

});
