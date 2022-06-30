const scrape = require('./index');

scrape.getPlayer("Ina").then(async stats => {
    let gfame = await scrape.getGuild(stats[0].guild).then(getFame => getFame[0].fame);

    let finalFame = (stats[0].fame / gfame) * 100;
    console.log(stats[0].fame);
    console.log(gfame);
    console.log(`${finalFame.toFixed(2)}%`);
});

// Gets only the name of the players in the guild
// scrape.getGuildPlayers(`wtf`, 50).then(async stats => {
//     let fame = [];
//     let gfame = await scrape.getGuild(`wtf`).then(getFame => getFame[0].fame);

//     for (let i = 0; i < stats.length; i++) {
//         let type = stats[i].name;
//         fame.push(parseInt(stats[i].fame));
        
//         console.log(`${type}: ${scrape.parseRank(stats[i].stars)}`);
//     }
//     let mostFame = Math.max(...fame);
//     let finalFame = (mostFame / gfame) * 100;
//     console.log(mostFame);
//     console.log(gfame);
//     console.log(`${finalFame.toFixed(2)}%`);
// });

//scrape.getPlayer(`there`).then(stats => console.log(stats));

//scrape.getGuild(`wtf`).then(stats => console.log(stats));

//scrape.getGuildPlayers(`wtf`, 3).then(stats => console.log(stats));
