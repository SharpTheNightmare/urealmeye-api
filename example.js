const scrape = require('./index');

scrape.getPlayer(`there`).then(stats => console.log(stats));
 
scrape.getGuild(`wtf`).then(stats => console.log(stats));

scrape.getGuildPlayers(`wtf`, 3).then(stats => console.log(stats));
