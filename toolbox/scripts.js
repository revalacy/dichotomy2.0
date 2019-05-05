const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../client_secret.json');
    const database = new GoogleSpreadsheet('1VSUPYWzYUgslSK0vQEe-Wh1DD-SwUEmc-Mi7lA-9S8A');
      database.useServiceAccountAuth(creds, function (err) {
        if (err)
        console.log(err)});
    const doc = new GoogleSpreadsheet('1gttI85xdLuZZmWedz7nemrfBSlotJGD6n_qdcDSgHV0');//DEV Database
      doc.useServiceAccountAuth(creds, function (err) {
        if (err)
        console.log(err)});
    const olddoc = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');
        olddoc.useServiceAccountAuth(creds, function (err) {
          if (err)
          console.log(err)});

module.exports =  {

gmids: ['142847091411124225','133090921678897152','133350100264157195', '89015728283320320', '106481950499282944', '142847796909834241', '82152330681647104', '143532142469578752', '453297386119233557'],

roll: async function(a, b){//returns number of successes
  var dice = parseInt(a);
  var roller = b;
  var rollsarray = Array.from({length: dice}, () => Math.floor(Math.random() *10) +1);
    console.log(rollsarray);
  var botches = rollsarray.filter(x => x === 1).length;
  var successes = rollsarray.filter(x => x > 6).length;
  var doubles = rollsarray.filter(x => x === 10).length;
    successes += doubles;
  console.log(successes);
  rollsarray.sort((x, y) => y - x);
  var rollstring = rollsarray.join(', ');
  if (successes > 0) botches = 0;
  if (botches > 0) this.doom(roller, botches);
  return new Promise(resolve => {
      resolve([successes, rollstring, botches]);
  });
},

roll_nb: async function(a, b){//returns number of successes
  var dice = parseInt(a);
  var roller = b;
  var rollsarray = Array.from({length: dice}, () => Math.floor(Math.random() *10) +1);
    console.log(rollsarray);
  var botches = rollsarray.filter(x => x === 1).length;
  var successes = rollsarray.filter(x => x > 6).length;
  var doubles = rollsarray.filter(x => x === 10).length;
    successes += doubles;
  console.log(successes);
  rollsarray.sort((x, y) => y - x);
  var rollstring = rollsarray.join(', ');
  if (successes > 0) botches = 0;
  return new Promise(resolve => {
      resolve([successes, rollstring, botches]);
  });
},

filepull: async function(a){
  var searcharray = a;
  if (!Array.isArray(searcharray) || searcharray.length === 0 || !searcharray.length) return console.log(`Filepull terminated, an array was not passed to the function.`);
  var records = await Promise.all(a.map(this.recordpull)).then(function(data){return Promise.all(data)});
  var success = 0;
  if (records.findIndex(x => x === 'failed') === -1) success = 1;
  console.log(`Record pull finished.`);
  return new Promise(resolve => resolve([success, records]));
},
  
dbwrite: async function(a){
    a.forEach(function(object){
        object.properties = JSON.stringify(object.properties);
        object.activeeffects = JSON.stringify(object.activeeffects);
        object.secrets = JSON.stringify(object.secrets);
        object.investigations = JSON.stringify(object.investigations);
        object.save();
    });
},
  
doom: async function(a, b){
  database.getRows(1, {'query': `label = "${a}"`}, function(err, rows){
    rows[0].properties = JSON.parse(rows[0].properties);
    var x = parseInt(rows[0].properties.doom) + b;
    rows[0].properties.doom = x;
    rows[0].properties = JSON.stringify(rows[0].properties)
    rows[0].save();
  });
},
  
recordpull: async function(label){
    return new Promise(resolve => {
      database.getRows(1, {'query': `label = "${label}"`}, function(err, rows){
        if (typeof rows.length === 'undefined') return resolve('failed');
        rows.forEach(function(object){
          console.log(`Parsing data for ${object.label}.`);
          object.properties = JSON.parse(object.properties);
          object.activeeffects = JSON.parse(object.activeeffects);
          object.secrets = JSON.parse(object.secrets);
          object.investigations = JSON.parse(object.investigations);
          return resolve(object);
        });
    });
    });
  },

items: {
  move: function(sender, recipient, item){
    sender.properties.inventory.splice(sender.properties.inventory.findIndex(x => x === item.label),1);
    if (recipient.properties.inventory[0] === "empty" || recipient.properties.inventory[0] === "Empty") recipient.properties.inventory = [];
    recipient.properties.inventory.push(item.label);
    item.properties.location[item.properties.location.findIndex(x => x === sender.label)] = recipient.label;
    this.dbwrite([sender, recipient, item]);
  },
  use: function(user){},
  damage: function(user){},
  hide: function(user){},
  repair: function(user){},
  eat: function(user){},
  equip: function(user){},
  dbwrite: async function(a){
    a.forEach(function(object){
        object.properties = JSON.stringify(object.properties);
        object.activeeffects = JSON.stringify(object.activeeffects);
        object.secrets = JSON.stringify(object.secrets);
        object.investigations = JSON.stringify(object.investigations);
        object.save();
    });
},
  },

locations: {
  enter: function(user){},
  leave: function(user){},
  sethome: function(user){},
  damage: function(user){},
  repair: function(user){},
  knock: function(user){},
  guestlist: function(user){},
  dbwrite: async function(a){
    a.forEach(function(object){
        object.properties = JSON.stringify(object.properties);
        object.activeeffects = JSON.stringify(object.activeeffects);
        object.secrets = JSON.stringify(object.secrets);
        object.investigations = JSON.stringify(object.investigations);
        object.save();
    });
},
},
  
dbCall: async function(){
  return new Promise(resolve => {
    database.getRows(1, {}, function(err, rows){
     if (err) return console.log(err);
      console.log(`dbCall finished.`);
     resolve(rows);
    });
  });
},
  
effects: {
      exposure: {
        add: {
          character: async function(name, parameters, source){
            database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
              if (typeof rows.length === "undefined") return console.log(`An error occurred pulling file for ${name}, effect function terminated.`);
              var object = rows[0];
              object.properties = JSON.parse(object.properties);
              object.activeeffects = JSON.parse(object.activeeffects);
              object.secrets = JSON.parse(object.secrets);
              object.investigations = JSON.parse(object.investigations);
              if (object.activeeffects.inbound.findIndex(x => x === parameters) != -1) return;
              if (!object.properties.madness.exposure) object.properties.madness.exposure = [];
              object.properties.madness.exposure.push(parameters[4]);
              if (parameters[5] === 'macro' && source === 'command') object.activeeffects.broadcast.push(parameters);
              if (!object.activeeffects.inbound) object.activeeffects.inbound = [];
              object.activeeffects.inbound.push(parameters);
              var location = object.properties.location;
              object.properties = JSON.stringify(object.properties);
              object.activeeffects = JSON.stringify(object.activeeffects);
              object.secrets = JSON.stringify(object.secrets);
              object.investigations = JSON.stringify(object.investigations);
              object.save();
              if (parameters[5] != 'macro' || object.properties.location === "Not set.") return;
              if (source === 'function') return;
              this.location(location, parameters, 'function');
            });
          },
          location: async function(name, parameters, source){
            database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
              if (typeof rows.length === "undefined") return console.log(`An error occurred pulling file for ${name}, effect function terminated.`);
              var location = rows[0];
              location.properties = JSON.parse(location.properties);
              location.activeeffects = JSON.parse(location.activeeffects);
              location.secrets = JSON.parse(location.secrets);
              location.investigations = JSON.parse(location.investigations);
              var occupants = location.properties.occupants;
              if (!location.activeeffects.broadcast) location.activeeffects.broadcast = [];
              if (location.activeeffects.broadcast.findIndex(x => x === parameters) != -1) return;
              location.activeeffects.broadcast.push(parameters);
              location.properties = JSON.stringify(location.properties);
              location.activeeffects = JSON.stringify(location.activeeffects);
              location.secrets = JSON.stringify(location.secrets);
              location.investigations = JSON.stringify(location.investigations);
              location.save();
              if (occupants.length < 1) return;
              occupants.forEach(function(name){
                this.character(name, parameters, 'function');
              })
            });
          }
        },
        remove: {
          character: async function(name, parameters, source){
            database.getRows(1, {'query': `location = "${name}"`}, function(err, rows){
              if (typeof rows.length === 'undefined') return console.log(`Effect removal failed for ${name}, terminating function.`);
              var object = rows[0];
              object.properties = JSON.parse(object.properties);
              object.activeeffects = JSON.parse(object.activeeffects);
              object.secrets = JSON.parse(object.secrets);
              object.investigations = JSON.parse(object.investigations);
              if (object.activeeffects.inbound.findIndex(x => x === parameters) === -1) return;
              object.activeeffects.inbound.splice(object.activeeffects.inbound.findIndex(x => x === parameters), 1);
              object.activeeffects.broadcast.splice(object.activeeffects.broadcast.findIndex(x => x === parameters), 1);
              object.properties.madness.exposure.splice(object.properties.madness.exposure.findIndex(x => x === parameters[4]), 1);
              var location = object.properties.location;
              object.properties = JSON.stringify(object.properties);
              object.activeeffects = JSON.stringify(object.activeeffects);
              object.secrets = JSON.stringify(object.secrets);
              object.investigations = JSON.stringify(object.investigations);
              object.save();
              if (parameters[5] != 'macro' || object.properties.location === 'Not set.' || source === 'function') return;
              this.location(location, parameters, 'function');
            });
          },
          location: async function(name, parameters, source){
            if (parameters[5] != 'macro') return;
            database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
              if (typeof rows.length === "undefined") return console.log(`An error occurred pulling file for ${name}, effect function terminated.`);
              var location = rows[0];
              location.properties = JSON.parse(location.properties);
              location.activeeffects = JSON.parse(location.activeeffects);
              location.secrets = JSON.parse(location.secrets);
              location.investigations = JSON.parse(location.investigations);
              var occupants = location.properties.occupants;
              if (!location.activeeffects.broadcast) location.activeeffects.broadcast = [];
              if (location.activeeffects.broadcast.findIndex(x => x === parameters) != -1) return;
              location.activeeffects.broadcast.splice(location.activeeffects.broadcast.findIndex(x => x === parameters), 1);
              location.properties = JSON.stringify(location.properties);
              location.activeeffects = JSON.stringify(location.activeeffects);
              location.secrets = JSON.stringify(location.secrets);
              location.investigations = JSON.stringify(location.investigations);
              location.save();
              if (occupants.length < 1) return;
              occupants.forEach(function(name){
                this.character(name, parameters, 'function');
              })
            });
          }
        }
      },
      stat_change: {
          add: {
            character: async function(name, parameters, source){
              database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
                if (typeof rows.length === 'undefined') return console.log(`An error occurred executing effects for ${name}, terminating effect function.`);
                var object = rows[0];
                object.properties = JSON.parse(object.properties);
                object.activeeffects = JSON.parse(object.activeeffects);
                object.secrets = JSON.parse(object.secrets);
                object.investigations = JSON.parse(object.investigations);
                var location = object.properties.location;
                object.properties[parameters[2]][parameters[3]] = parseInt(object.properties[parameters[2]][parameters[3]]) + parseInt(parameters[4]);
                if (source === 'command' && parameters[5] === 'macro') object.activeeffects.broadcast.push(parameters);
                object.properties = JSON.stringify(object.properties);
                object.activeeffects = JSON.stringify(object.activeeffects);
                object.secrets = JSON.stringify(object.secrets);
                object.investigations = JSON.stringify(object.investigations);
                object.save();
                if (parameters[5] != 'macro' || location === 'Not set.' || source === 'function') return;
                this.location(location, parameters, 'function');
              });
            },
            location: async function(name, parameters, source){
              if (parameters[5] != 'macro') return;
              database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
                if (typeof rows.length === "undefined") return console.log(`An error occurred pulling file for ${name}, effect function terminated.`);
                var location = rows[0];
                location.properties = JSON.parse(location.properties);
                location.activeeffects = JSON.parse(location.activeeffects);
                location.secrets = JSON.parse(location.secrets);
                location.investigations = JSON.parse(location.investigations);
                var occupants = location.properties.occupants;

                location.properties = JSON.stringify(location.properties);
                location.activeeffects = JSON.stringify(location.activeeffects);
                location.secrets = JSON.stringify(location.secrets);
                location.investigations = JSON.stringify(location.investigations);
                location.save();
                if (occupants.length < 1) return;
                occupants.forEach(function(name){
                  this.character(name, parameters, 'function');
                });
              });
            }
          },
          remove: {
            character: async function(name, parameters, source){
              database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
                if (typeof rows.length === 'undefined') return console.log(`An error occurred executing effects for ${name}, terminating effect function.`);
                var object = rows[0];
                object.properties = JSON.parse(object.properties);
                object.activeeffects = JSON.parse(object.activeeffects);
                object.secrets = JSON.parse(object.secrets);
                object.investigations = JSON.parse(object.investigations);
                var location = object.properties.location;
                

                object.properties = JSON.stringify(object.properties);
                object.activeeffects = JSON.stringify(object.activeeffects);
                object.secrets = JSON.stringify(object.secrets);
                object.investigations = JSON.stringify(object.investigations);
                object.save();
              });
            },
            location: async function(name, parameters, source){
              database.getRows(1, {'query': `label = "${name}"`}, function(err, rows){
                if (typeof rows.length === "undefined") return console.log(`An error occurred pulling file for ${name}, effect function terminated.`);
                var location = rows[0];
                location.properties = JSON.parse(location.properties);
                location.activeeffects = JSON.parse(location.activeeffects);
                location.secrets = JSON.parse(location.secrets);
                location.investigations = JSON.parse(location.investigations);
                var occupants = location.properties.occupants;

                location.properties = JSON.stringify(location.properties);
                location.activeeffects = JSON.stringify(location.activeeffects);
                location.secrets = JSON.stringify(location.secrets);
                location.investigations = JSON.stringify(location.investigations);
                location.save();
              });
            }
          }
        }
      },

event_pull: async function(id){
  return new Promise(resolve => {
    database.getRows(1, {'query': `userid = ${id}`}, function(err, rows){
      if (typeof rows.length === "undefined") return console.log(`An error occurred pulling file for ${id}, event function terminated.`);
      var object = rows[0];
      object.properties = JSON.parse(object.properties);
      object.activeeffects = JSON.parse(object.activeeffects);
      object.secrets = JSON.parse(object.secrets);
      object.investigations = JSON.parse(object.investigations);

      resolve(object);
    });
  })
},

username_pull: async function(id){
  return new Promise(resolve =>{
    database.getRows(1, {'query': `userid = ${id}| userid = "${id}"`}, function(err, rows){
     if (typeof rows.length === "undefined") return resolve("none");
    var names = [];
    rows.forEach(function(object){
      names.push(object.nickname);
    });
    var namestring = names.join(' | ');
    resolve(namestring); 
    });
    
  })
},
mobaction: async function(identifier, instance){
  

},
mobattack: async function(){

},
mobdefense: async function(){

},
mobheal: async function(){

},
mobsupport: async function(){

},
autodefense: async function(client, channels, victim){
  var [state, files] = await this.filepull([victim, 'combat']);
  var rollfunc = this.roll.bind({});
  var rollfunc_nb = this.roll_nb.bind({});
  if (state === 0) return;
  var victimfile = files[0];
  var combat = files[1];
  var combat_info = combat.properties[parseInt(victimfile.properties.active_combat)];
  var defstat = 'str';
  if (+victimfile.properties.stats.str < +victimfile.properties.stats.dex) defstat = 'dex';
  var msgarray = [`${victim} did not roll defense before the round ended so defense has been automatically rolled using ${defstat}. Here are the results:`];
  var totaldmg = 0;
  for (var i = 0; i < victimfile.properties.attacks.length; i++){
    var [attacker, attackroll, attackstring, damagepool] = victimfile.properties.attacks[i];
    var dicepool = parseInt(victimfile.properties.stats.protection) + parseInt(victimfile.properties.stats[defstat]) + parseInt(victimfile.properties.bonuses.protection) + parseInt(victimfile.properties.bonuses[defstat]);
    victimfile.properties.bonuses[defstat] = 0;
    victimfile.properties.bonuses.protection = 0;
    var [successes, rollstring, botches] = await rollfunc(dicepool, victim);
    attackroll = parseInt(attackroll);
    var defstate = 'success';
    if (attackroll > successes) defstate = 'failure';
    var statemsg = `Success! No damage is taken.`;
    if (defstate === 'failure') {
      var mindamage = attackroll - parseInt(victimfile.properties.stats.soak);
      if (mindamage < 0) mindamage = 1;
      damagepool = parseInt(damagepool) + mindamage;
      var [dmgsuccesses, dmgstring, dmgbotches] = await rollfunc_nb(damagepool, attacker);
      if (dmgsuccesses > 0) botches = 0;
      if (dmgsuccesses > 0) {
          totaldmg += dmgsuccesses;
          var [hp, maxhp] = victimfile.properties.stats.hp.split('/');
          var newhp = parseInt(hp) - dmgsuccesses;
          victimfile.properties.stats.hp = `${newhp}/${maxhp}`;
    };
    statemsg = `Failure! ${dmgsuccesses} damage is generated from ${attacker}'s damage roll. **[${dmgstring}]**`;
  };
    var msg = `${successes} successes **[${rollstring}]** are rolled against ${attacker}'s attack roll of ${attackroll} **[${attackstring}]**. ${statemsg}`;
    msgarray.push(msg);
  };
  var incapmsg = ``;
  var [health, max] = victimfile.properties.stats.hp.split('/');
  health = parseInt(health);
  if (health < 1) {
    incapmsg = ` ${victim} has been incapacitated! They will be unable to act unless revived.`;
    victimfile.state = 'incap';
  };
  msgarray.push(`${victim} takes a total of ${totaldmg} damage from all attacks.${incapmsg}`);
  var messages = msgarray.join(`\n\n`);
  var hpmsg = `${victim} is now at ${victimfile.properties.stats.hp} health.`;
  client.users.get(victimfile.userid).send(hpmsg);
  channels[combat_info.channel].send(messages);
  this.dbwrite([victimfile]);
},
autodamage: async function(client, channels, victim){
  var [state, files] = await this.filepull([victim, 'combat']);
  if (state === 0) return;
  var victimfile = files[0];
  var combat = files[1];
  var combat_info = combat.properties[parseInt(victimfile.properties.active_combat)];
  var attackinfo = victimfile.properties.damages.shift();
  var [attacker, damagepool] = attackinfo;
  var mindamage = attackroll - parseInt(victimfile.properties.stats.soak);
  if (mindamage < 0) mindamage = 1;
  damagepool = parseInt(damagepool) + mindamage;
  var [dmgsuccesses, dmgstring, botches] = await this.roll_nb(damagepool, attacker);
  var incapmsg = ``;
  if (dmgsuccesses > 0) {
    var [hp, maxhp] = victimfile.properties.stats.hp.split('/');
    var newhp = parseInt(hp) - dmgsuccesses;
    victimfile.properties.stats.hp = `${newhp}/${maxhp}`;
    if (newhp <= 0) {
      incapmsg = ` ${victim} has been incapacitated and cannot act unless revived!`;
      victimfile.state = 'incapacitated';
    };
  };
  var msg = `${victim} previously failed their defense roll and no other combatants attempted to cover them! They take ${dmgsuccesses} points of damage from ${attacker}.${incapmsg}`;
  channels[combat_info.channel].send(msg);
  this.dbwrite([victimfile]);
},
next_turn: async function(client, channels, combatfile, index){
  var combat_info = combatfile.properties[index];
  combat_info.remaining.shift();
  var next = combat_info.remaining[0];
  if (!next) {
    combat_info.remaining = combat_info.skipped;
    if (combat.info.remaining.length === 0) return this.end_round(client, channels, combatfile, index);
    next = combat_info.remaining[0];
  };
  if (combat_info.mobs.indexOf(next) != -1) {
    return this.mobaction(channels, next, index);
  };
  var nextinfo = await this.filepull([next]);
  var nextuser = client.users.get(nextinfo.userid);
  var msg = `${nextuser} **${nextinfo.nickname}** is now up! You currently have ${combat_info.participants[next]} action points available to spend. For a list of all available actions, use the command \`/help combat\`.`;
  channels[combat_info.channel].send(msg);
  combatfile.properties[index] = combat_info;
  this.dbwrite([combatfile]);
},

next_round: async function(client, channels, combatfile, index){
var defense = this.autodefense.bind({});
var combat_info = combatfile.properties[index];
combat_info.remaining = combat_info.turn_order;//populate round turn order
combat_info.skipped = []; //clear skipped
combat_info.turn_order.forEach(function(object){//give everyone 4 more action points
  combat_info.participants[object] = parseInt(combat_info.participants[object]) + 4;
});
combat_info.round += 1;//increment the round
combat_info.stage = "action";//set the stage to action
combat_info.defense = [...new Set(combat_info.defense)];
combat_info.damage = [...new Set(combat_info.damage)];
combat_info.defense.forEach(function(object){//automatically run oustanding defense

});
combat_info.damage.forEach(function(object){//automatically run oustanding damage

});
var ondeck = combat_info.remaining[0];//pull the first person on deck
var [state, [ondeck_info]] = await this.filepull([ondeck]);
if (state === 0) return channels.test.send(`An error occurred pulling the character file for ${ondeck}.`)
var ondeck_user = client.users.get(ondeck_info.userid);
channels[combat_info.channel].send(`Round ${combat_info.round} START!\n\n**${ondeck_user}** **${ondeck_info.nickname}** is now up! You currently have ${combat_info.participants[ondeck]} action points available to spend. For a list of all available actions, use the command \`/help combat\`.`);
var gm = client.users.get(combat_info.gm_id);
var gm_msg = `\`\`\`Combat has been declared by ${gm.username}\nInstance: ${index}\nChannel: ${combat_info.channel}\nStage: Action\nState: Active\nRound: ${combat_info.round}\`\`\``;
channels[gm_log].fetchMessage(combat_info.gm_msg).edit(gm_msg);
combat[index] = combat_info;
return this.dbwrite([combat]);
},

end_round: async function(client, channels, combatfile, index){
  var combat_info = combatfile.properties[index];

}

}