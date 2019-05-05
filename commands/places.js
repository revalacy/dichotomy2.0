const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [name, subcommand, target, ...args], channels) => {
   
  var user = message.author;
  
  async function resolve() {
    if (subcommand === "enter"){
      
    };
    if (subcommand === ""){

    };
    if (subcommand === ""){

    };
    if (subcommand === ""){

    };
    if (subcommand === ""){

    };
    if (subcommand === ""){

    };
    if (subcommand === ""){

    };
  }
  
  resolve();
  
  async function executeeffects(parameters){
    scripts.effects[parameters.shift()]();
  }
  
}