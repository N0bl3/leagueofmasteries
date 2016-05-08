/*jshint unused: false, esnext: true, node: true*/
/*eslint-env node, es6, express*/
const fs = require("fs");
let request = require('request');
let RateLimiter = require('request-rate-limiter');
let limiter = new RateLimiter({
	rate: 1000,
	interval: 10,
	backOffCode: 429,
	backOffTime: 1,
	maxWaitingTime: 120
});
let express = require('express');
let cfenv = require('cfenv');
let appEnv = cfenv.getAppEnv();
let bodyParser = require('body-parser');
let pug = require('pug');
let app = express();

let api = "api_key=" + process.env.RIOT_API;
app.engine('pug', pug.renderFile);
app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: true
}));

let champions;

function regionToPlatformId(region) {
	switch (region) {
		case "eune":
			return "EUN1";
		case "euw":
			return "EUW1";
		case "lan":
			return "LA1";
		case "las":
			return "LA2";
		case "oce":
			return "OCE1";
		case "na":
			return "NA1";
		case "jp":
			return "JP1";
		case "br":
			return "BR1";
		case "ru":
			return "RU";
		case "tr":
			return "TR1";
		case "kr":
			return "KR";
	}
}

function champIdToChampObject(champId) {
	for (let champion in champions) {
		if (champId == champions[champion].id) {
			return champions[champion];
		}
	}
	return false;
}

function isRegion(str) {
	return /br|eune|euw|kr|lan|las|oce|ru|tr|na|jp/.test(str);
}

function isLettersAndNumbers(str) {
	return /^[a-zA-Z0-9]+$/.test(str);
}

function getChampionsListFromAPI() {
	limiter.request({
		url: "https://global.api.pvp.net/api/lol/static-data/euw/v1.2/champion?champData=image,tags&" + api,
		method: "GET",
		json: true
	}, function (error, response) {
		if (!error && response.statusCode == 200) {
			champions = response.body.data;
			writeChampionsList(champions);
			console.log("Champions retrieved. First champion: ", champions.Aatrox);
			return champions;
		}
		throw new Error("Error retrieving champions\nStatus Code : " + response.statusCode);
	});
}
function getChampionsList() {
	try{
	fs.readFile("data/champions.json", (err, data) => {
		if (err) {
			console.error(err);
			throw err;
		}
		return data;
		
	});
	}catch(err){
		if (err instanceof Error) {
			console.log(err);
			return;
		}
		throw new Error("Can't get champions list");
	}
}
function writeChampionsList(champions) {
	if(champions){
	try{
	fs.writeFile("data/champions.json", champions, (err) => {
		if (err) {
			throw err;
		}
			console.log("Updated champions list.");
			return;
	});
	}catch(err){
		if (err instanceof Error) {
			console.log(err);
			return;
		}
		throw new Error("Can't write champions list");
	}
	} else {
		console.log("Nothing to write");
		return false;
	}
}

function initializeWorkspace() {
	try {
		fs.mkdir("data", (err) => {
			if (err) {
				throw err;
			}
		});
	} catch (err) {
		if (err instanceof Error) {
			if (err.code != "EEXIST") {
			console.log("Error", err);
			return;
			}
			console.log("data dir already exists");
		}
		throw new Error("Can't initialize :" + err);
	}
	writeChampionsList(champions);
	console.log("Initialized");
}

initializeWorkspace();
getChampionsListFromAPI();
var championFetch = setInterval(getChampionsListFromAPI, 86400);

app.get("/", function (req, res) {
	res.render('pre.pug', {}, function (err, html) {
		if (!err) {
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
	if (isRegion(req.params.region) && isLettersAndNumbers(req.params.summonerName)) {
		let region = req.params.region;
		let summonerName = req.params.summonerName;
		limiter.request({
			url: "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.4/summoner/by-name/" + summonerName + "?" + api,
			method: "GET",
			json: true
		}, function (error, response) {
			if (!error && response.statusCode == 200 && req.query.friend !== "true") {
				console.log("Body:", response.body);
				let body = response.body[summonerName];
				res.render("index.pug", {
					region: region,
					playerName: summonerName,
					summonerName: body.name,
					profileIconId: body.profileIconId,
					id: body.id,
					champions: champions
				}, function (err, html) {
					if (!err) {
						res.send(html);
					} else {
						console.error(err.message);
						res.end(err.message);
					}
				});
			} else if (!error && response.statusCode == 200 && req.query.friend === "true") {
				console.log("Friend: " + response.body);
				res.send(response.body);
			} else {
				console.error("Error at endpoint : /:region/:summonerName\nStatus Code : " + response.statusCode);
				res.sendStatus(response.statusCode);
			}
		});
	}
});

//Get a champion mastery by player id and champion id. Response code 204 means there were no masteries found for given player id or player id and champion id combination. (RPC)
//Curently misses highestGrade
app.get("/:region/pid/:playerId/cid/:championId", function (req, res) {
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.playerId) && !isNaN(req.params.championId)) {
		let region = req.params.region;
		let platformId = regionToPlatformId(region);
		let playerId = req.params.playerId;
		let championId = req.params.championId;
		limiter.request({
			url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/champion/" + championId + "?" + api,
			method: "GET",
			json: true
		}, function (error, response) {
			if (!error && response.statusCode == 200) {
				response.body.championName = champIdToChampObject(response.body.championId).name;
				let preparedResponse = response.body;
				//				Gets highest grade for a champion... Temporary fix
				limiter.request({
					url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/champions" + "?" + api,
					method: "GET",
					json: true
				}, function (error, response) {
					if (!error && response.statusCode == 200) {
						let bestChampions = response.body;
						for (let i = 0; i < bestChampions.length; i++) {
							if (preparedResponse.championId == bestChampions[i].championId) {
								preparedResponse.highestGrade = bestChampions[i].highestGrade;
								break;
							}
						}
						if (!preparedResponse.highestGrade) {
							preparedResponse.highestGrade = "None";
						}
						res.send(preparedResponse);
					} else {
						console.error("Error at endpoint : /:region/pid/:playerId/cid/:championId\nStatus Code : " + response.statusCode);
						res.sendStatus(response.statusCode);
					}

				});
			} else if (!error && response.statusCode == 204) {
				res.status(204).end(response.statusCode + " : No masteries found for given player id or player id and champion id combination");
			} else {
				console.error("Error at endpoint : /:region/pid/:playerId/cid/:championId\nStatus Code : " + response.statusCode);
				res.sendStatus(response.statusCode);
			}
		});
	} else {
		res.sendStatus(400);
	}
});

//Get all champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:region/pid/:playerId/champions", function (req, res) {
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
		let region = req.params.region;
		let platformId = regionToPlatformId(req.params.region);
		let playerId = req.params.playerId;
		limiter.request({
			url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/champions" + "?" + api,
			method: "GET",
			json: true
		}, function (error, response) {
			if (!error && response.statusCode == 200) {
				response.body.forEach(function (champion) {
					champion = Object.assign(champion, champIdToChampObject(champion.championId));
				});
				res.send(response.body);
			} else {
				console.error("Error at endpoint : /:platformId/pid/:playerId/champions\nStatus Code : " + response.statusCode);
				res.sendStatus(response.statusCode);
			}
		});
	} else {
		res.sendStatus(400);
	}
});

//Get a player's total champion mastery score, which is sum of individual champion mastery levels (RPC)
app.get("/:region/pid/:playerId", function (req, res) {
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
		let region = req.params.region;
		let platformId = regionToPlatformId(region);
		let playerId = req.params.playerId;
		console.log(region, platformId, playerId);
		limiter.request({
			url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/score" + "?" + api,
			method: "GET"
		}, function (error, response) {
			if (!error && response.statusCode == 200) {
				res.send(response.body);
			} else if (!error) {
				res.status(response.statusCode).end();
			} else {
				console.error("Error at endpoint : /:platformId/pid/:playerId\nStatus Code : " + response.statusCode + " " + response.body);
				res.sendStatus(response.statusCode);
			}
		});
	} else {
		res.sendStatus(400);
	}
});

//Get specified number of top champion mastery entries sorted by number of champion points descending (RPC)
app.get("/:region/pid/:playerId/top", function (req, res) {
	let count = req.query.count || 5;
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
		let region = req.params.region;
		let platformId = regionToPlatformId(req.params.region);
		let playerId = req.params.playerId;
		limiter.request({
			url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/topchampions" + "?count=" + count + "&" + api,
			method: "GET",
			json: true
		}, function (error, response) {
			if (!error && response.statusCode == 200) {
				response.body.forEach(function (champion) {
					champion = Object.assign(champion, champIdToChampObject(champion.championId));
				});
				res.send(response.body);
			} else {
				console.error("Error at endpoint : /:platformId/pid/:playerId/top\nStatus Code : " + response.statusCode);
				res.sendStatus(response.statusCode);
			}
		});
	} else {
		res.sendStatus(400);
	}
});

//Get current game players
app.get("/:region/pid/:playerId/game-team", function (req, res) {
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
		let region = req.params.region;
		let platformId = regionToPlatformId(region);
		let playerId = req.params.playerId;
		limiter.request({
			url: "https://" + region + ".api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/" + platformId + "/" + playerId + "?" + api,
			method: "GET",
			json: true
		}, function (error, response) {
			if (!error && response.statusCode == 200) {
				console.log(response.body);
				res.send(response.body.participants);
			} else {
				console.error(response);
				console.error("Error at endpoint : /:region/pid/:playerId/game-team\nStatus Code : " + response.statusCode);
				res.sendStatus(response.statusCode);
			}
		});
	} else {
		res.sendStatus(400);
	}
});

//Get data on a specific champion
app.get("/:region/champion/:championId", function (req, res) {
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.championId)) {
		let championId = req.params.championId;
		res.send(champIdToChampObject(championId));
	} else {
		res.sendStatus(400);
	}
});

//Get best ranked player for a given champion
//Recommend champion based on style
app.get("/:region/pid/:playerId/recommended", function (req, res) {
	console.log(req.params);
	if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
		let region = req.params.region;
		let platformId = regionToPlatformId(region);
		let playerId = req.params.playerId;
		limiter.request({
			url: "https://" + region + ".api.pvp.net/championmastery/location/" + platformId + "/player/" + playerId + "/champions" + "?" + api,
			method: "GET",
			json: true
		}, function (error, response) {
			if (!error && response.statusCode == 200) {
				let scoreByRole = {};
				let possessedChampions = [];

				response.body.forEach(function (champion) {
					possessedChampions.push(champion.championId);
				});
				possessedChampions.forEach(function (championId) {
					let championTags;

					for (let champion in champions) {
						if (championId == champions[champion].id) {
							championTags = champions[champion].tags;

							scoreByRole[championTags[0]] = scoreByRole[championTags[0]] ? scoreByRole[championTags[0]] + 2 : 2;

							console.log(championId, scoreByRole);
							if (championTags[1]) {
								scoreByRole[championTags[1]] = scoreByRole[championTags[1]] ? scoreByRole[championTags[1]] + 1 : 1;
							}
							break;
						}
					}
				});

				let best = [["lol", "lol"], [0, 0]];

				for (let role in scoreByRole) {
					let score = scoreByRole[role];

					if (score > best[1][1]) {
						if (score > best[1][0]) {
							best[0][1] = best[0][0];
							best[0][0] = role;
							best[1][1] = best[1][0];
							best[1][0] = score;
						} else {
							best[0][1] = role;
							best[1][1] = score;
						}
					}
				}


				let specialistsChampions = [];
				let lessSpecialistsChampions = [];
				let diversityChampions = [];

				for (let champion in champions) {

					if (best[0][0] == champions[champion].tags[0]) {
						if (best[0][1] == champions[champion].tags[1]) {
							specialistsChampions.unshift(champions[champion]);

						} else {
							lessSpecialistsChampions.push(champions[champion]);
						}
					} else if (best[0][0] != champions[champion].tags[0] && best[0][0] != champions[champion].tags[1] && best[0][1] != champions[champion].tags[0] && best[0][1] != champions[champion].tags[1]) {
						diversityChampions.push(champions[champion]);
					}
				}
				let chooseOne = function (array) {
					let len = array.length;
					let index = Math.floor(Math.random() * len);
					return array[index];
				};

				let specialist = specialistsChampions.length > 0 ? chooseOne(specialistsChampions) : lessSpecialistsChampions.length > 0 ? chooseOne(lessSpecialistsChampions) : "";
				let nemesis = diversityChampions.length > 0 ? chooseOne(diversityChampions) : "";

				res.send(JSON.stringify({
					best: best[0][0],
					secondBest: best[0][1],
					specialist: specialist,
					nemesis: nemesis
				}));

			} else {
				console.error("Error at endpoint : /:platformId/pid/:playerId/recommended\nStatus Code : " + response.statusCode);
				res.sendStatus(response.statusCode);
			}
		});
	} else {
		res.sendStatus(400);
	}
});

// Runs the server
app.listen(appEnv.port, function () {
	console.log("server starting on " + appEnv.url);
});
