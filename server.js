/*jshint esnext: true, devel: true, node: true*/
var request = require('request');
var express = require('express');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');
var pug = require('pug');
var app = express();

var appEnv = cfenv.getAppEnv();

var api = "api_key=" + process.env.RIOT_API;

app.engine('pug', pug.renderFile);
app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", function (req, res) {
    res.render('index.pug', function (err, html) {
    	if(!err){
        	res.send(html);
        } else {
        	console.error(err);
        }
    });
});
//Get summoner info from his name and location
app.get("/:platformId/sname/:summonerName", function (req, res) {
	if (/br|eune|euw|kr|lan|las|oce|ru|tr|na|jp|/.test(req.params.platformId) && /^[a-zA-Z0-9]+$/.test(summonerName)){
	console.log(req.params);
    var sName = req.params.summonerName;
    request({
        url: "https://euw.api.pvp.net/api/lol/" + req.params.platformId + "/v1.4/summoner/by-name/" + sName + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body[sName]);
            res.end(body);
        } else {
            console.error("Error at endpoint : /:platformId/:summonerName\nStatus Code : " + response.statusCode);
        }
    });
    } else {
    	res.sendStatus(400).end();
    }
});

//Get a champion mastery by player id and champion id. Response code 204 means there were no masteries found for given player id or player id and champion id combination. (RPC)
app.get("/:platformId/pid/:playerId/champid/:championId", function (req, res) {
    request({
        url: "https://" + req.params.platformId + ".api.pvp.net/api/lol/championmastery/location/" + req.params.platformId + "/player/" + req.params.playerId + "/champion/" + req.params.championId + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.stringify(body);
            res.end(body);
        } else if(!error && response.statusCode == 204) {
        	res.sendStatus(204).end();
        } else {
            console.error("Error at endpoint : /:platformId/:playerId/:championId\nStatus Code : " + response.statusCode);
        }
    });
});
//Get all champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:platformId/pid/:playerId/champions", function (req, res) {
    request({
        url: "https://" + req.params.platformId + ".api.pvp.net/api/lol/championmastery/location/" + req.params.platformId + "/player/" + req.params.playerId + "/champions" + "?" + api,
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
app.get("/:platformId/pid/:playerId", function (req, res) {
    request({
        url: "https://" + req.params.platformId + ".api.pvp.net/api/lol/championmastery/location/" + req.params.platformId + "/player/" + req.params.playerId + "/score" + "?" + api,
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
app.get("/:platformId/pid/:playerId/top", function (req, res) {
    request({
        url: "https://" + req.params.platformId + ".api.pvp.net/api/lol/championmastery/location/" + req.paramsplatformId + "/player/" + req.paramsplayerId + "/topchampions" + "?" + api,
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
