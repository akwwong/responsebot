/////////////////////////////////////////////////////////////////////////
// --------------------------- //
// SIMPLE DISCORD RESPONSE BOT //
// --------------------------- //
// TO DO LIST:
// - SEARCHES YOUTUBE FOR MUSIC PLAYBACK
/////////////////////////////////////////////////////////////////////////

// required for discord
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// required for fetch
const fetch = require('node-fetch');

// import the database from repl.it
const Database = require("@replit/database")

// create a new database on repl.it
const db = new Database()

// uses env token to login
const TOKEN = process.env['TOKEN']
client.login(TOKEN)

// an array of trigger words for bot to respond to
const sadWords = ["sad", "depressed", "unhappy", "angry"];

// an array of starter encouragements to populate the database
const starterEncouragements = [
  "Cheer up!",
  "Hang in there.",
  "You are a great person."
];

// load database with encouragements
db.get("encouragements").then(encouragements => {
  // if database is null or has length of 0 or less
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements);
  }
})

// helper function for updating encouragements
function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push(encouragingMessage);
    db.set("encouragements", encouragements);
  })
}

// helper function for deleting encouragements
function deleteEncouragement(index) {
    db.get("encouragements").then(encouragements => {
    if (encouragements.length > index) {
    encouragements.splice(index, 1);
    db.set("encouragements", encouragements);
    }
  })
}

// helper function for checking encouragements
function checkEncouragements() {
  db.get("encouragements").then(encouragements => {
    for (i = 0; i < encouragements.length; i++) {
    console.log((i + 1) + ". " + encouragements[i]);
    }
    console.log("--------------------------------");
  })
}

// to fetch zenquotes API
function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json();
    })
    .then(data => {
      return data[0]["q"] + " - " + data[0]["a"];
    })
}

// to get evilinsult API
function getInsult() {
  return fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json")
    .then(res => {
      return res.json();
    })
    .then(data => {
      return data["insult"];
    })
}

// ready event - shows on console that the bot is logged in
client.on('ready', () => {
  console.log('Logged in as', client.user.tag);
})

// bot message responses
client.on('messageCreate', (msg) => {
  // if the bot is messaging itself
  if (msg.author.bot) { 
    return;
  }
  // if anybody else is messaging
  // bot reads messages from discord to check for commands
  if (msg.content === '!inspire') { 
    getQuote().then(quote => msg.channel.send(quote));
  }
  if (msg.content === '!insult') { 
    getInsult().then(quote => msg.channel.send(quote));
  }

  // check string from messages read in discord and replies appropriately
  if (sadWords.some(word => msg.content.includes(word))) {
    db.get("encouragements").then(encouragements => {
      const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      msg.reply(encouragement)
    })
  }

  // adds encouragement string to end of database array
  if (msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1];
    updateEncouragements(encouragingMessage);
    msg.channel.send("New encouraging message added.");
  }

  // deletes encouragement string in the database [index + 1]
  if (msg.content.startsWith("$del")) {
    index = (parseInt(msg.content.split("$del ")[1]) - 1);
    deleteEncouragement(index);
    msg.channel.send("Encouraging message deleted on list - #" + (index + 1));
  }

  // command to check the database
  if (msg.content.startsWith("$check")) {
    checkEncouragements();
    msg.channel.send("Checking encouragements on console.");
  }
})