const request = require('request');
const cheerio = require('cheerio');
const lodash = require('lodash');
const cfg = require('./config.js');

var playerDataHeaders = [
	"name",
	"fame",
	"exp",
	"stars",
	"guild",
	"guildRank",
	"desc1",
	"desc2",
	"desc3",
];

const guildDataHeaders = [
	"name",
	"members",
	"characters",
	"rank",
	"fame",
	"exp",
	"desc1",
	"desc2",
	"desc3",
];

const guildPlayerDataHeaders = [
	"name",
	"stars",
	"guildRank",
	"fame",
	"experience",
	"characters",
	"lastseen",
	"servers",
	"averageFame",
	"averageExp",
];

/**
 * @param {*} el
 * @param {*} type
 * @param {*} $
 * @returns $(el).text()
 */
function parseWebData (el, type, $) {
	switch (type) {
		case cfg.PLAYER_DATA.NAME || cfg.GUILD_DATA.NAME:
			return $(el).text().replace(/\n?\t/g, '');
		default:
			return $(el).text();
	}
}

/**
 *
 * @param {*} $
 * @param {*} info
 * @param {*} dataHeader
 * @param {*} results
 * @returns `parsed_data`
 */
function parseData ($, info, dataHeader, results = 1) {
	let parsed_data = [];
	for (var i in info) {
		info[i].data = lodash.slice(info[i].data, 0, results);

		parsed_data[i] = [];
		$(info[i].data).each((j, el) => {
			parsed_data[i][j] = parseWebData(el, info[i].type, $);
		});
	}
	parsed_data = lodash.map(lodash.zip(...parsed_data), Array => {
		return lodash.zipObject(dataHeader, Array);
	});
	return parsed_data;
}

/**
 * @param {*} playerRank
 * @returns Stringed star name
 */
function parseRank(playerRank)
{
	if (playerRank >= 0 && playerRank <= 17)
	{
		return "Light blue";
	}
	else if (playerRank >= 18 && playerRank <= 35)
	{
		return "Dark blue";
	}
	else if (playerRank >= 36 && playerRank <= 53)
	{
		return "Red";
	}
	else if (playerRank >= 54 && playerRank <= 71)
	{
		return "Orange";
	}
	else if (playerRank >= 72 && playerRank <= 89)
	{
		return "Yellow";
	}
	else if (playerRank == 90) { return "White"; }
	else { return "Empty"; }

}

/**
 * @param {string} playerName
 */
async function getPlayer (playerName) {
    if (typeof playerName !== 'string') {
        return 'Player name must be a string';
    }
    let url = cfg.PLAYER_URL + playerName;
	console.info(`Fetching player '${playerName}' from '${url}'`);
    return new Promise((resolve, reject) => {
		request(
			{
				url: url,
				headers: {
					"user-agent": cfg.USER_AGENT
				}
			},
			(err, res, body) => {
				if (!err && res.statusCode == 200) {
					var $ = cheerio.load(body);
					console.info("Successfully loaded player page");
					let allEls = [];

					let name = $(`span.entity-name`);
					allEls.push({data: name, type: cfg.PLAYER_DATA.NAME});

					let desc1 = $(`.well.description .line1.description-line`);
					let desc2 = $(`.well.description .line2.description-line`);
					let desc3 = $(`.well.description .line3.description-line`);

					var nodelist = "table.summary > tbody > tr";
					for (let i = 1; i < $(nodelist).toArray().length; i++) {
						var p_StringCheck = $(`${nodelist}:nth-child(${i}) > td:nth-child(1)`).text();
						var p_StringPull = $(`${nodelist}:nth-child(${i}) > td:nth-child(2)`);
						var p_NumericPull = $(`${nodelist}:nth-child(${i}) > td .numeric`);
						var stars = $(`${nodelist}:nth-child(${i}) > td div.star-container`);
						if (p_StringCheck === "Fame") {
							allEls.push({data: p_NumericPull, type: cfg.PLAYER_DATA.FAME});
						} else if (p_StringCheck === "Exp") {
							allEls.push({data: p_NumericPull, type: cfg.PLAYER_DATA.EXP});
						} else if (p_StringCheck === "Rank") {
							allEls.push({data: stars, type: cfg.PLAYER_DATA.STARS});
						} else if (p_StringCheck === "Guild") {
							allEls.push({data: p_StringPull, type: cfg.PLAYER_DATA.GUILD});
						} else if (p_StringCheck === "Guild Rank") {
							allEls.push({data: p_StringPull, type: cfg.PLAYER_DATA.GUILDRANK});
						}
					}
					allEls.push(
						{data: desc1, type: cfg.PLAYER_DATA.DESC1},
						{data: desc2, type: cfg.PLAYER_DATA.DESC2},
						{data: desc3, type: cfg.PLAYER_DATA.DESC3},
					);

					resolve(parseData($, allEls, playerDataHeaders));
				} else {
					console.error(
						reject(
							"Could not get player due to an error" + err
						)
					);
				}
			}
		);
	});
}

/**
 * @param {string} guildName
 */
async function getGuild (guildName) {
    if (typeof guildName !== 'string') {
        return 'Guild name must be a string';
    }
    let url = cfg.GUILD_URL + guildName;
	console.info(`Fetching '${guildName}' stats from '${url}'`);
	return new Promise((resolve, reject) => {
		request(
			{
				url: url,
				headers: {
					"user-agent": cfg.USER_AGENT
				}
			},
			(err, res, body) => {
				if (!err && res.statusCode == 200) {
					var $ = cheerio.load(body);
					console.info("Successfully loaded guild page");
					let allEls = [];


					let name = $(`span.entity-name`);
					let members = $(`.summary > tbody > tr:nth-child(1) > td:nth-child(2)`);
					let characters = $(`.summary > tbody > tr:nth-child(2) > td:nth-child(2)`);
					let rank = $(`.summary > tbody > tr:nth-child(3) > td:nth-child(2) > a`);
					let fame = $(`.summary > tbody > tr:nth-child(3) > td .numeric`);
					let exp = $(`.summary > tbody > tr:nth-child(4) > td .numeric`);
					let desc1 = $(`.well.description .line1.description-line`);
					let desc2 = $(`.well.description .line2.description-line`);
					let desc3 = $(`.well.description .line3.description-line`);

					allEls.push(
						{ data: name, type: cfg.GUILD_DATA.NAME },
						{ data: members, type: cfg.GUILD_DATA.MEMBERS },
						{ data: characters, type: cfg.GUILD_DATA.CHARS },
						{ data: rank, type: cfg.GUILD_DATA.RANK },
						{ data: fame, type: cfg.GUILD_DATA.FAME },
						{ data: exp, type: cfg.GUILD_DATA.EXP },
						{ data: desc1, type: cfg.GUILD_DATA.DESC1 },
						{ data: desc2, type: cfg.GUILD_DATA.DESC2 },
						{ data: desc3, type: cfg.GUILD_DATA.DESC3 },
					);

					resolve(parseData($, allEls, guildDataHeaders));
				} else {
					console.error(
						reject(
							"Could not get guild due to an error" + err
						)
					);
				}
			}
		);
	});
}

/**
 * @param {string} guildName
 * @param {number} maxResults
 */
async function getGuildPlayers (guildName, maxResults = 50) {
    if (typeof guildName !== 'string') {
        return 'Guild name must be a string';
    }
    if (maxResults > 50) {
		console.log(`Max results is 50.`);
        return;
	}
    let url = cfg.GUILD_URL + guildName;
	console.info(`Fetching '${guildName}' players from '${url}' with ${maxResults} results`);
	return new Promise((resolve, reject) => {
		request(
			{
				url: url,
				headers: {
					"user-agent": cfg.USER_AGENT
				}
			},
			(err, res, body) => {
				if (!err && res.statusCode == 200) {
					var $ = cheerio.load(body);
					console.info("Successfully loaded guild players");
					let allEls = [];

					let names = $(".table-responsive > table > tbody > tr > td:nth-child(1)");
					let stars = $(".table-responsive > table > tbody > tr > td:nth-child(5)");
					let guildRanks = $(".table-responsive > table > tbody > tr > td:nth-child(2)");
					let fame = $(".table-responsive > table > tbody > tr > td:nth-child(3)");
					let exp = $(".table-responsive > table > tbody > tr > td:nth-child(4)");
					let characters = $(".table-responsive > table > tbody > tr > td:nth-child(6)");
					let lastseens = $(".table-responsive > table > tbody > tr > td:nth-child(7)");
					let servers = $(".table-responsive > table > tbody > tr > td:nth-child(8)");
					let avgfame = $(".table-responsive > table > tbody > tr > td:nth-child(9)");
					let avgexp = $(".table-responsive > table > tbody > tr > td:nth-child(10)");

					allEls.push(
						{ data: names, type: cfg.GUILD_PLAYER_DATA.NAME },
						{ data: stars, type: cfg.GUILD_PLAYER_DATA.STARS },
						{ data: guildRanks, type: cfg.GUILD_PLAYER_DATA.GUILDRANK },
						{ data: fame, type: cfg.GUILD_PLAYER_DATA.FAME },
						{ data: exp, type: cfg.GUILD_PLAYER_DATA.EXP },
						{ data: characters, type: cfg.GUILD_PLAYER_DATA.CHARS },
						{ data: lastseens, type: cfg.GUILD_PLAYER_DATA.LASTSEEN },
						{ data: servers, type: cfg.GUILD_PLAYER_DATA.SERVER },
						{ data: avgfame, type: cfg.GUILD_PLAYER_DATA.AVGFAME },
						{ data: avgexp, type: cfg.GUILD_PLAYER_DATA.AVGEXP },
					);

					resolve(parseData($, allEls, guildPlayerDataHeaders, maxResults));
				} else {
					console.error(
						reject(
							"Could not get players due to an error" + err
						)
					);
				}
			}
		);
	});
}
module.exports = {
	parseWebData,
	parseData,
	parseRank,
    getPlayer,
    getGuild,
	getGuildPlayers
};
