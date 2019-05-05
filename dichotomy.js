require('./express.js');

const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");


const client = new Discord.Client();
client.token = process.env.discord_token;
client.prefix = process.env.discord_prefix;
// We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!

client.on("ready", () => {
  console.log("I am ready!");
 });
 
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});
 
client.commands = new Enmap();
 
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Loading command ${commandName}`);
    client.commands.set(commandName, props);
  });
});
 
client.login(client.token);