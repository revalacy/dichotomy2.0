const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [name, subcommand, item, ...args], channels) => {
   
  var user = message.author.id;
  
  async function resolve() {
    if (subcommand === "send"){
      var recipient = args.shift();
      var note = args.join(' ');
      if (!note) note = '';
      var [state, files] = await scripts.filepull([name, recipient, item]);
      if (state === 0) return message.channel.send(`A file could not be found for ${files}, please check your spelling and try again.`);
      var [userfile, recipientfile, itemfile] = files;
      //ownership checks
      if (user != userfile.userid) return message.channel.send(`You cannot use commands for someone else's character.`);
      if (itemfile.category != 'item') return message.channel.send(`You can't just have a ${itemfile.category} in your inventory.`)
      if (itemfile.properties.location != userfile.label) return message.channel.send(`You must have an item in your inventory to send it. You can pick up the item using the command \`/items ${name} take ${item}\``);
      scripts.items.move(userfile, recipientfile, itemfile);
      message.channel.send(`Item sent successfully.`);
      client.users.get(recipientfile.userid).send(``);
      //check for effects
      if (itemfile.activeeffects.source.proximity){
        var effects = item.activeeffects.source.proximity;
        effects.forEach(function(effect){
          var [itemname, func, property, subproperty, value, scope] = effect;
          
        });
      };
    };
    if (subcommand === "take"){
      var [state, files] = await scripts.filepull([name, item]);
      if (state === 0) return message.channel.send(`A file could not be found for ${files}, please check your spelling and try again.`);
      var [userfile, itemfile] = files;
      if (user != userfile.userid) return message.channel.send(`You cannot use commands for someone else's character.`);
      if (itemfile.category != 'item') return message.channel.send(`You can't just put a ${itemfile.category} into your inventory.`);
      if (userfile.properties.location != itemfile.properties.location) return message.channel.send(`You must be in the same place as ${itemfile.nickname} to pick it up.`);
      var [state, file] = await scripts.filepull([itemfile.properties.location]);
      if (state === 0) return message.channel.send(`Could not find the file for ${item.nickname}'s location. Command terminated, please reach out to Enambris.`);
      var locationfile = file[0];
      if (locationfile.category != 'location') return message.channel.send(`That's stealing! Stealing isn't supported yet.`);
      scripts.items.move(locationfile, userfile, itemfile);
      //check for effects
      message.channel.send(`You have added ${itemfile.nickname} to your inventory.`);
    };
    if (subcommand === "discard"){

    };
    if (subcommand === "use"){

    };
    if (subcommand === "damage"){

    };
    if (subcommand === "hide"){

    };
    if (subcommand === "repair"){

    };
    if (subcommand === "eat"){

    };
    if (subcommand === "equip"){

    };
  }
  
  resolve();
  
  
  
}