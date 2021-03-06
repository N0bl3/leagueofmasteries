# LeagueOfMasteries
## RIOT API Developers Challenge April 2016

[Live App HERE](https://leagueofmasteries.eu-gb.mybluemix.net/)

### Description
The provided interface gives information about:
- [x] A player's top champions;
- [x] A player's progression over mastery of all champions;
- [x] A player's game team mastery of champions played in this game;
- [ ] Best players for a given champion;
- [ ] A quizz on a player's mastered champions;
- [x] Recommendation on the next champion to buy to either diversify a player's gameplay or specialize before the end of the API contest.

### How to use
Go to the [Live App](https://leagueofmasteries.eu-gb.mybluemix.net/) and enter a summoner name; you'll gain access to this player mastery info.
Depending on how far development went :

- Progression tab is your progression over mastering all champions
- Top 12 is your top 12 most mastered champions ranked in descending order
- Champion would give you a way to compare a champion mastery with other players / share with Facebook to come
- Team is your current game team mastery for each player chosen champion
- Quizz will be a quizz concerning your best champions
- Leaderboards should show you who masters a given champion the most / Comparison with friends to come

### Install on your server?

Requires Node >= 6.1.0 & a RIOT Developer API Key

```batchfile
$ git clone https://github.com/N0bl3/leagueofmasteries.git

$ cd leagueofmasteries

$ npm install

$ set NODE_ENV=production

$ set RIOT_API={Your API KEY}

$ npm start
```

### Software used
- [NodeJS 6](https://nodejs.org/en/)
- [Bootstrap 3](http://getbootstrap.com/)
- [Cloud Foundry](https://www.cloudfoundry.org/)
- [Express](http://expressjs.com/)
- [Pug](http://jade-lang.com/)
- [request](https://github.com/request/request)
- [request-rate-limiter](https://github.com/eventEmitter/request-rate-limiter)

# Thanks to all above software contributors

### Why did i enter the contest?
As a self taught JS developer, I wanted to prove to myself that i could design a fully functional web-app & that's when i landed on LoL home-page telling about RIOT API Developers Challenge April 2016!
What a great topic to work on! My favourite game craves for new talents! As soon as i read the contest rules i jumped in. I didn't have a clear idea of what to do at first, but the idea was to make the most out of what was provided.

### Disclaimer
LeagueOfMasteries isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
