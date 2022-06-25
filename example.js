const scrape = require('./index');


// Gets player info of 'there'
// broken for ye and dream
scrape.getPlayer(`there`).then(stats => {
    let stars = scrape.parseRank(stats[0].stars);
    console.log(stats[0]);
    console.log(stars);
});

// Gets only the name of the players in the guild
// scrape.getGuildPlayers(`wtf`, 50).then(stats => {
//     for (let i = 0; i < stats.length; i++) {
//         let type = stats[i].name;
//         console.log(type);
//     }
// });

//scrape.getPlayer(`there`).then(stats => console.log(stats));
        
//scrape.getGuild(`wtf`).then(stats => console.log(stats));

//scrape.getGuildPlayers(`wtf`, 3).then(stats => console.log(stats));
