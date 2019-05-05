const scripts = require('../toolbox/scripts.js');
module.exports = (client, message) => {
    // Ignore all bots
  
    const native = ['giphy', 'tenor', 'tts', 'me', 'tableflip', 'unflip', 'shrug', 'spoiler', 'nick'];
  
    if (message.author.bot) return;
    if ((message.content.toLowerCase().indexOf('fuck you') != -1 || message.content.toLowerCase().indexOf('screw you') != -1 || message.content.toLowerCase().indexOf('i hate you') != -1) && message.content.toLowerCase().indexOf('dichotomy') != -1) return message.channel.send('Fuck you too, buddy.');
    if (message.content.toLowerCase().indexOf('dichotomy') != -1 && message.content.toLowerCase().indexOf('tea') != -1 && scripts.gmids.includes(message.author.id) != false) return message.channel.send({files: ["https://media1.tenor.com/images/30aad3d79b4b34bbe82dbac3aa996d7c/tenor.gif"]})
    
    if (message.content.indexOf(client.prefix) !== 0 && message.channel.type === "dm") {
      async function resolve(){
      var string = await scripts.username_pull(message.author.id);
      var datestamp = new Date(message.createdTimestamp);
      var text = `\`\`\`DM From: ${message.author.username}\nCharacters: ${string}\nDate: ${datestamp}\n\nMessage:\n${message.content}\`\`\``;
      return client.channels.get('570317013105508371').send(text);
      }
      return resolve();
    };

    if (message.content.indexOf(client.prefix) !== 0) return;
   
    // Our standard argument/command name definition.
    const args = message.content.slice(client.prefix.length).trim().split(/ +(?![^\[]*\])/g);
    const command = args.shift().toLowerCase();
   
    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);
    const channels = {
      mom: client.users.get('453297386119233557'),
      dad: client.users.get('508722657085095965'),
     main_ls: client.channels.get('190551198804213760'),
     command: client.channels.get('393102181089411072'),
     tertiary: client.channels.get('521781175279157248'),
     eng: client.channels.get('418190188242534420'),
     scp: client.channels.get('418159387790671872'),
     icc: client.channels.get('418159580971925504'),
     srg: client.channels.get('418159537368072202'),
     med: client.channels.get('478651616011223060'),
     aos: client.channels.get('486648092112715776'),
     cr: client.channels.get('536966323197181953'),
     test: client.channels.get('390953758944788482'),
      general1: client.channels.get('501432736951828511'),
      general2: client.channels.get('501433103282208778'),
      general3: client.channels.get('501433155287384074'),
      hq: client.channels.get('388155010787311616'),
      toll: client.channels.get('459496149745795102'),
      event1: client.channels.get('428444580397187073'),
      event2: client.channels.get('465269676826427412'),
      event3: client.channels.get('476590068321222656'),
      divebar: client.channels.get('379799932208676865'),
      ingamerolls: client.channels.get('500385281849950208'),
      beloved: client.channels.get('466276382306205726'),
      teaparty: client.channels.get('469177364987904030'),
      chosen: client.channels.get('553720374039281664'),
      euphoria: client.channels.get('468901438467211264'),
      dementia: client.channels.get('469177281730838528'),
      door: client.channels.get('492729743364325376'),
      madrolls: client.channels.get('464285635729948682'),
      bottest: client.channels.get('362448929637400576'),
      botroom: client.channels.get('254740468867268608'),
      eventroom: client.channels.get('503634158308818954'),
      air_raid: client.channels.get('459496291085451274'),
      high_rolls: client.channels.get('463209999817113601'),
      catchup: client.channels.get('449633963896602645')
  };
  
    
    // If that command doesn't exist, silently exit and do nothing
    if (!cmd && native.findIndex(x => x === command) === -1) return message.channel.send(`${message.author}! No.`);
  
    if (!cmd && native.findIndex(x => x === command) != -1) return;
   
    // Run the command
    console.log(`Command ${command} executed by nickname: [${message.author.username}]; userid: [${message.author.id}]. Timestamp: ${new Date()}`);
    cmd.run(client, message, args, channels);
  };