const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [name, stat, ability]) => {
  if (stat === "strength") stat = "str";
  if (stat === "dexterity") stat = "dex";
  if (stat === "stamina") stat = "sta";
  if (stat === "perception") stat = "per";
  if (stat === "intelligence") stat = "int";
  if (stat === "charisma") stat = "cha";
  if (stat != 'str' && stat != 'dex' && stat != 'sta' && stat != 'per' && stat != 'int' && stat !='cha') return message.channel.send(`You may only roll stat-ability with this command.`);
  if (ability != 'martial' && ability != 'protection' && ability != 'guile' && ability != 'healing' && ability != 'support' && ability != 'comprehension' && ability != 'stand' && ability != 'influence' && ability != 'athletics' && ability != 'resistance') return message.channel.send(`You may only roll stat-ability with this command.`);

    async function resolve(){
       var [state, [file]] = await scripts.filepull([name]);
       console.log(file.properties.full_name);
       if (file.isupdated === 0 || file.isupdated === '0') return message.channel.send(`You must update your character before you can roll.`);
       if (state === 0) return message.channel.send(`A record could not be pulled for ${name}, please try again.`);
       var user = message.author.id;
       if (user != file.userid) return message.channel.send(`You are not the registered owner of ${name}, your command has not been processed. If you believe this is an error, contact an administrator.`);
       var dicepool = +file.properties.stats[stat] + +file.properties.stats[ability];
       if (Number.isNaN(dicepool)) return message.channel.send(`That's not a real stat! Check your spelling!`);
       var [successes, rolls, botch] = await scripts.roll(dicepool, name);
       var msg = `${name} rolls ${dicepool} dice for ${successes} successes! **[${rolls}]**`;
       message.channel.send(msg);
    }
  
  resolve();
}