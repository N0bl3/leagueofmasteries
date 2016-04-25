/*jshint devel: true, node: true*/
var request = require('request');
var express = require('express');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');

var app = express();

var appEnv = cfenv.getAppEnv();
var api = appEnv.app.RIOTAPI || "No API key selected";

var riotURL;
try {
    if (api) {
        var riotURL = "https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/RiotSchmick?api_key=" + api;

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

// Runs the server
app.listen(appEnv.port, function () {

    console.log("server starting on " + appEnv.url);

});
