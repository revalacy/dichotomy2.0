const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, args, channels) => {
   
  var user = message.author;
  
  async function resolve() {
    var [state, [countfile]] = await scripts.filepull(['counter']);
    console.log(`State = ${state}`);
    var now = new Date();
    var resetdate = new Date(countfile.properties.reset);
    var count = Math.floor((now - resetdate)/1000/60/60/24);
    console.log(count);
    if (args[0] === 'reset'){
      if (message.author.id != '142847091411124225') return message.channel.send(`Only Enambris can reset this counter!`);
      countfile.properties.reset = new Date();
      scripts.dbwrite([countfile]);
      return message.channel.send(`Enambris had to yell at someone! The counter has been reset.`);
    };
    var plural = 's';
    if (count === 1) plural = '';
    return message.channel.send(`It has been **${count}** day${plural} since Enambris last had to yell at someone. The count was last reset on ${resetdate}.`);
    
  }
  
  resolve();
  
}