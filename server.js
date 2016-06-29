const RateLimiter = require('request-rate-limiter');
const limiter = new RateLimiter({
  rate: 1000,
  interval: 10,
  backOffCode: 429,
  backOffTime: 1,
  maxWaitingTime: 120,
});
const express = require('express');
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const bodyParser = require('body-parser');
const pug = require('pug');
const app = express();

const api = `api_key=${process.env.RIOT_API}`;
app.engine('pug', pug.renderFile);
app.set('views', `${__dirname}/views`);
app.use(express.static('public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true,
}));

let champions;
let version;
/**
 *Convert region string to platform ID string
 * @param {String} region
 * @returns {String} platform ID
 */
function regionToPlatformId(region) {
  switch (region) {
    case 'eune':
      return 'EUN1';
    case 'euw':
      return 'EUW1';
    case 'lan':
      return 'LA1';
    case 'las':
      return 'LA2';
    case 'oce':
      return 'OCE1';
    case 'na':
      return 'NA1';
    case 'jp':
      return 'JP1';
    case 'br':
      return 'BR1';
    case 'ru':
      return 'RU';
    case 'tr':
      return 'TR1';
    case 'kr':
      return 'KR';
    default:
      return '';
  }
}
/**
 * Return a specific champion given its ID
 * @param {String} champId
 * @returns {Object}  The wanted champion
 */
function champIdToChampObject(champId) {
  return Object.keys(champions).some((champion) => champId === champions[champion].id);
}

/**
 * Checks if the string corresponds to an existing region
 * @param {String} str
 * @returns {boolean}
 */
function isRegion(str) {
  return /br|eune|euw|kr|lan|las|oce|ru|tr|na|jp/.test(str);
}

function isLettersAndNumbers(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Get the version of the game and a list of all champions
 */
function getGameInfo() {
  limiter.request({
    url: `https://global.api.pvp.net/api/lol/static-data/euw/v1.2/champion?champData=all&${api}`,
    method: 'GET',
    json: true,
  }, (error, response) => {
    if (!error && response.statusCode === 200) {
      champions = response.body.data;
      version = response.body.version;
    }
    if (error) {
      throw new Error('Cannot connect to Riot API');
    }
  });
}

app.get('/', (req, res) => {
  res.render('pre.pug', {}, (err, html) => {
    if (!err) {
      res.send(html);
    }else {
      res.status(500).end('Error while starting app!');
    }
  });
});

// Get summoner info from his name and location
app.get('/:region/sname/:summonerName', (req, res) => {
  /**
   * @name req.query.friend Is the user's friend
   */
  if (isRegion(req.params.region) && isLettersAndNumbers(req.params.summonerName)) {
    const region = req.params.region;
    const playerName = req.params.summonerName;
    const friend = req.query.friend || false;
    limiter.request({
      url: `https://region.api.pvp.net/api/lol/${region}/v1.4/summoner/by-name/${playerName}?${api}`,
      method: 'GET',
      json: true,
    }, (error, response) => {
      if (!error && response.statusCode === 200 && friend !== 'true') {
        const body = response.body[playerName];

        res.render('index.pug', {
          region,
          playerName,
          summonerName: body.name,
          profileIconId: body.profileIconId,
          id: body.id,
          champions,
          version,
        }, (err, html) => {
          if (!err) {
            res.send(html);
          }else {
            res.end(err.message);
          }
        });
      }else if (!error && response.statusCode === 200 && friend === 'true') {
        res.send(response.body);
      }else {
        console.error(error);
        res.status(500).end('Error while starting app!');
      }
    });
  }
});

// Get a champion mastery by player id and champion id.
// Response code 204 means there were no masteries found for
// given player id or player id and champion id combination. (RPC)
// Currently misses highestGrade
app.get('/:region/pid/:playerId/cid/:championId', (req, res) => {
  if (isRegion(req.params.region) && !isNaN(req.params.playerId) && !isNaN(req.params.championId)) {
    const region = req.params.region;
    const platformId = regionToPlatformId(region);
    const playerId = req.params.playerId;
    const championId = req.params.championId;
    limiter.request({
      url: `https://${region}.api.pvp.net/championmastery/location/${platformId}/player/${playerId}/champion/${championId}?${api}`,
      method: 'GET',
      json: true,
    }, (error, response) => {
      if (!error && response.statusCode === 200) {
        const preparedResponse = response.body;
        preparedResponse.championName = champIdToChampObject(response.body.championId).name;
        //				Gets highest grade for a champion... Temporary fix
        limiter.request({
          url: `https://${region}.api.pvp.net/championmastery/location/${platformId}/player/${playerId}/champions?${api}`,
          method: 'GET',
          json: true,
        }, (error2, response2) => {
          if (!error2 && response2.statusCode === 200) {
            const bestChampions = response2.body;
            for (let i = 0; i < bestChampions.length; i++) {
              if (preparedResponse.championId === bestChampions[i].championId) {
                preparedResponse.highestGrade = bestChampions[i].highestGrade;
                break;
              }
            }
            if (!preparedResponse.highestGrade) {
              preparedResponse.highestGrade = 'None';
            }
            res.send(preparedResponse);
          }else {
            res.sendStatus(response2.statusCode);
          }
        });
      }else if (!error && response.statusCode === 204) {
        res.status(204).end(
          `${response.statusCode}
          No masteries found for given player id or player id and champion id combination`
        );
      }else {
        res.sendStatus(response.statusCode);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

// Get all champion mastery entries sorted by number of champion points descending (RPC)
app.get('/:region/pid/:playerId/champions', (req, res) => {
  if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
    const region = req.params.region;
    const platformId = regionToPlatformId(req.params.region);
    const playerId = req.params.playerId;
    limiter.request({
      url: `https://${region}.api.pvp.net/championmastery/location/${platformId}/player/${playerId}/champions?${api}`,
      method: 'GET',
      json: true,
    }, (error, response) => {
      if (!error && response.statusCode === 200) {
        response.body.forEach((champion) => {
          Object.assign(champion, champIdToChampObject(champion.championId));
        });
        res.send(response.body);
      }else {
        res.sendStatus(response.statusCode);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

// Get a player's total champion mastery score,
// which is sum of individual champion mastery levels (RPC)
app.get('/:region/pid/:playerId', (req, res) => {
  if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
    const region = req.params.region;
    const platformId = regionToPlatformId(region);
    const playerId = req.params.playerId;
    limiter.request({
      url: `https://${region}.api.pvp.net/championmastery/location/${platformId}/player/${playerId}/score?${api}`,
      method: 'GET',
    }, (error, response) => {
      if (!error && response.statusCode === 200) {
        res.send(response.body);
      }else if (!error) {
        res.status(response.statusCode).end();
      }else {
        res.sendStatus(response.statusCode);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

// Get specified number of top champion mastery entries
// sorted by number of champion points descending (RPC)
app.get('/:region/pid/:playerId/top', (req, res) => {
  const count = req.query.count || 5;
  if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
    const region = req.params.region;
    const platformId = regionToPlatformId(req.params.region);
    const playerId = req.params.playerId;
    limiter.request({
      url: `https://${region}.api.pvp.net/championmastery/location/${platformId}/player/${playerId}/topchampions?count=${count}&${api}`,
      method: 'GET',
      json: true,
    }, (error, response) => {
      if (!error && response.statusCode === 200) {
        response.body.forEach((champion) => {
          Object.assign(champion, champIdToChampObject(champion.championId));
        });
        res.send(response.body);
      }else {
        res.sendStatus(response.statusCode);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

// Get current game players
app.get('/:region/pid/:playerId/game-team', (req, res) => {
  /**
   * @name req.query.participants
   */
  if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
    const region = req.params.region;
    const platformId = regionToPlatformId(region);
    const playerId = req.params.playerId;
    limiter.request({
      url: `https://${region}.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/${platformId}/${playerId}?${api}`,
      method: 'GET',
      json: true,
    }, (error, response) => {
      if (!error && response.statusCode === 200) {
        res.send(response.body.participants);
      }else {
        res.sendStatus(response.statusCode);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

// Get data on a specific champion
app.get('/:region/champion/:championId', (req, res) => {
  /**
   * @name req.params.championId
   */
  if (isRegion(req.params.region) && !isNaN(req.params.championId)) {
    const championId = req.params.championId;
    res.send(champIdToChampObject(championId));
  }else {
    res.sendStatus(400);
  }
});

// Recommend champion based on style
// champion.tags n'existe pas!!!
app.get('/:region/pid/:playerId/recommended', (req, res) => {
  /**
   * @name req.params.playerId
   */
  function chooseOne(array) {
    const len = array.length;
    const index = Math.floor(Math.random() * len);
    return array[index];
  }

  if (isRegion(req.params.region) && !isNaN(req.params.playerId)) {
    const region = req.params.region;
    const platformId = regionToPlatformId(region);
    const playerId = req.params.playerId;
    limiter.request({
      url: `https://${region}.api.pvp.net/championmastery/location/${platformId}/player/${playerId}/champions?${api}`,
      method: 'GET',
      json: true,
    }, (error, response) => {
      if (!error && response.statusCode === 200) {
        const scoreByRole = {};
        const possessedChampions = [];

        response.body.forEach((champion) => {
          possessedChampions.push(champion.championId);
        });
        possessedChampions.forEach((championId) => {
          let championTags;
          Object.keys(champions).forEach(champion => {
            if (championId === champions[champion].id) {
              championTags = champions[champion].tags;

              scoreByRole[championTags[0]] = scoreByRole[championTags[0]]
                ? scoreByRole[championTags[0]] + 2 : 2;

              if (championTags[1]) {
                scoreByRole[championTags[1]] = scoreByRole[championTags[1]]
                  ? scoreByRole[championTags[1]] + 1 : 1;
              }
            }
          });
        });

        const best = [['lol', 'lol'], [0, 0]];
        Object.keys(scoreByRole).forEach(role => {
          const score = scoreByRole[role];

          if (score > best[1][1]) {
            if (score > best[1][0]) {
              best[0][1] = best[0][0];
              best[0][0] = role;
              best[1][1] = best[1][0];
              best[1][0] = score;
            }else {
              best[0][1] = role;
              best[1][1] = score;
            }
          }
        });

        const specialistsChampions = [];
        const lessSpecialistsChampions = [];
        const diversityChampions = [];
        Object.keys(champions).forEach(champion => {
          if (best[0][0] === champions[champion].tags[0]) {
            if (best[0][1] === champions[champion].tags[1]) {
              specialistsChampions.unshift(champions[champion]);
            }else {
              lessSpecialistsChampions.push(champions[champion]);
            }
          }else if (
            best[0][0] !== champions[champion].tags[0] &&
            best[0][0] !== champions[champion].tags[1]
            && best[0][1] !== champions[champion].tags[0]
            && best[0][1] !== champions[champion].tags[1]
          ) {
            diversityChampions.push(champions[champion]);
          }
        });

        const specialist = (() => {
          let toReturn = '';
          if (specialistsChampions.length) {
            toReturn = chooseOne(specialistsChampions);
          }else if (lessSpecialistsChampions.length) {
            toReturn = chooseOne(lessSpecialistsChampions);
          }
          return toReturn;
        })();
        const nemesis = diversityChampions.length > 0 ? chooseOne(diversityChampions) : '';

        res.send(JSON.stringify({
          best: best[0][0],
          secondBest: best[0][1],
          specialist,
          nemesis,
        }));
      }else {
        res.sendStatus(response.statusCode);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

app.get('/render/quizz/cid/:championId/:grade', (req, res) => {
  if (!isNaN(req.params.championId)) {
    const championId = req.params.championId;
    const quizzChampion = Object.keys(champions)
      .forEach(champion => championId === champions[champion].id);
    res.render('quizz.pug', {
      champion: quizzChampion,
      grade: req.params.grade,
    }, (err, html) => {
      if (!err) {
        res.send(html);
      }else {
        res.end(err.message);
      }
    });
  }else {
    res.sendStatus(400);
  }
});

setInterval(getGameInfo, 1000 * 60 * 60 * 24);

// Runs the server
/* eslint-disable no-console*/
app.listen(appEnv.port, () => {
  console.log(`server starting on ${appEnv.url}`);
});
/* eslint-enable no-console*/
