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

var champions;

function regionToPlatformId(region){
	switch (region){
		case "eune":
			return "eun1";
		case "euw":
			return "euw1";
		case "lan":
			return "la1";
		case "las":
			return "la2";
		case "oce":
			return "oce1";
		case "na":
			return "na1";
		case "jp":
			return "jp1";
		case "br":
			return "br1";
		case "ru":
			return "ru";
		case "tr":
			return "tr1";
		case "kr":
			return "kr";
	}
}

function champIdToChampObject(champId){
		champions.forEach(function(champion){
			if (champId == champion.id) {
				return champion;
			}
		});
		return false;
}

//Get champions list
request({
		url: "https://global.api.pvp.net/api/lol/static-data/euw/v1.2/champion?" + api,
		method: "GET",
		json: true
}, function(error, response, body){
		if (!error && response.statusCode == 200){
			champions = body.data;
		} else {
			console.error("Error retrieving champions\nStatus Code : " + response.statusCode);
		}
});

app.get("/", function (req, res) {
		res.render('index.pug', {champions: champions}, function (err, html) {
    		if(!err){
        		res.send(html);
        	} else {
        		console.error(err);
        		res.end("Error while starting app!");
        	}
    	});
});

//Get summoner info from his name and location
app.get("/:region/sname/:summonerName", function (req, res) {
	console.log(req.params);
	var region = req.params.region;
	var summonerName =req.params.summonerName;
	if (/br|eune|euw|kr|lan|las|oce|ru|tr|na|jp/.test(req.params.region) && /^[a-zA-Z0-9]+$/.test(req.params.summonerName)){
    request({
        url: "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.4/summoner/by-name/" + summonerName + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body[summonerName]);
        } else {
            console.error("Error at endpoint : /:region/:summonerName\nStatus Code : " + response.statusCode);
        }
    });
    } else {
    	res.sendStatus(400).end();
    }
});

//Get a champion mastery by player id and champion id. Response code 204 means there were no masteries found for given player id or player id and champion id combination. (RPC)
app.get("/:region/pid/:playerId/champid/:championId", function (req, res) {
	console.log(req.params);
	var region = req.params.region;
	var platformId = regionToPlatformId(req.params.region);
	var playerId = req.params.playerId;
	var championId = req.params.championId;
    request({
        url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/champion/" + championId + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else if(!error && response.statusCode == 204) {
        	res.status(204).end();
        } else {
            console.error("Error at endpoint : /:platformId/pid/:playerId/:championId\nStatus Code : " + response.statusCode);
        }
    });
});

//Get all champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:region/pid/:playerId/champions", function (req, res) {
	console.log(req.params);
	var region = req.params.region;
	var platformId = regionToPlatformId(req.params.region);
	var playerId = req.params.playerId;
    request({
        url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/champions" + "?" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            console.error("Error at endpoint : /:platformId/pid/:playerId/champions\nStatus Code : " + response.statusCode);
        }
    });
});

//Get a player's total champion mastery score, which is sum of individual champion mastery levels (RPC)
app.get("/:region/pid/:playerId", function (req, res) {
	console.log(req.params);
	var region = req.params.region;
	var platformId = regionToPlatformId(region);
	var playerId = req.params.playerId;
	console.log(region, platformId, playerId);
    request({
        url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/score" + "?" + api,
        method: "GET"
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else if (!error) {
        	res.status(response.statusCode).end();
        } else {
            console.error("Error at endpoint : /:platformId/pid/:playerId\nStatus Code : " + response.statusCode + " " + body);
        }
    });
});

//Get specified number of top champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:region/pid/:playerId/top", function (req, res) {
	if (req.query.n){
		req.query.n = 3;
	}
	console.log(req.params);
	var region = req.params.region;
	var platformId = regionToPlatformId(req.params.region);
	var playerId = req.params.playerId;
    request({
        url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/topchampions" + "?count=" + req.query.n + "&" + api,
        method: "GET",
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            console.error("Error at endpoint : /:platformId/pid/:playerId/top\nStatus Code : " + response.statusCode);
        }
    });
});

// Runs the server
app.listen(appEnv.port, function () {
    console.log("server starting on " + appEnv.url);
});
