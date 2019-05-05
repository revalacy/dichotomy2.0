const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [name, subcommand, ...args], channels) => {
   
  var user = message.author;
  const guild = client.guilds.get('');
  const roles = {
    members: guild.roles.find('name', 'Glass Network Members')
  };
  
  async function resolve() {
    
    if (subcommand === 'open'){// /event EventName open
      
    };
    if (subcommand === 'start'){// /event EventName start

    };
    
  }
  
  function channelpull(id){
    return channels.keys(channels).find(key => channels[key].id === id);
  }

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  resolve();
  
}