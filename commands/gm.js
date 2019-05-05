const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [subcommand, ...args], channels) => {
   
  var user = message.author;
   if(scripts.gmids.includes(message.author.id) === false) return message.channel.send('You must be a GM to use that command. Please contact an admin if you believe this message was sent in error.');
  
  async function resolve() {
    if (subcommand === 'whisper'){// /gm whisper Target message here...
      var target = args.shift;
      var text = args.join(' ');
      if (text.indexOf('<') != -1) {
        var [newtext, image] = text.split('<');
        image = image.replace('>', '');
        text = newtext;
      };
      text = `\`\`\`${text}\`\`\``;
      text = text.replace('``````', '');
      var [success, [file]] = await scripts.filepull([target]);
      if (success === 0) return message.channel.send(`A file could not be found for ${target}.`);
      var character = client.users.get(file.userid);
      if (!image) return character.send(text);
      return character.send(text, {files: [image]});
    };
    if (subcommand === 'text'){// /gm text channel message here...
      var target = args.shift();
      var text = args.join(' ');
      if (text.indexOf('<') != -1) {
      var [newtext, image] = text.split('<');
      image = image.replace('>', '');
      text = newtext;
      };
      text = `\`\`\`${text}\`\`\``;
      text = text.replace('``````', '');
      if (!image) return channels[target].send(text);
      return channels[target].send(text, {files: [image]});
    };
    if (subcommand === 'doom'){//gm doom Name quantity msgchannel text
      var target = args.shift();
      console.log(target);
      var quantity = args.shift();
      quantity = parseInt(quantity);
      var channel = args.shift();
      var msg = args.join(' ');
      var [state, files] = await scripts.filepull([target]);
      console.log(files[0].properties.stats);
      if (state === 0) return message.channel.send(`Could not find file, please check your spelling and try again.`);
      var newdoom = parseInt(files[0].properties.doom) - quantity;
      files[0].properties.doom = newdoom;
      scripts.dbwrite(files);
      if (channel === 'dm') return client.users.get(files[0].userid).send(msg);
      return channels[channel].send(msg);
    };
    if (subcommand === 'combat'){//gm combat branch ...args
          var branch = args.shift();
          if (branch === 'initiate'){ //gm combat initiate channel
                var chnnl = args.shift();
                
                var [state, files] = await scripts.filepull(['combat']);
                if (state === 0) return message.channel.send();
                var combat = files[0];
                var index = combat.properties.length;
                var opening = `\`\`\`Welcome to Glass Network Combat! Get ready to join battle!\`\`\`\n\nCombat has been initiated. That means those who intend to participate in the fight need to **Join Battle**. Your initiative roll is based on a **Wits-Comprehension** roll that will be triggered with your command. Turn order will be determined by number of successes in order from greatest to least. Ties are broken by RNG.\n\nThis combat system utilizes **Action Points**. Different types of actions will have varying costs to execute, regardless of magical or mundane nature. 4 action points are regained per round, and points can be stocked up to execute higher-cost or special skills. Your turn ends when you have run out of Action Points, or when you have ended your turn via command.\n\nOnce you register to join the battle, a list of combat commands and available actions will be sent to you via DM. If you have questions, please reach out to the GM(s). A GM may skip your turn if you fail to post in a timely manner and will come back to any skipped players at the end of the round.\n\nTo accommodate large numbers of players and cut down on the time taken on each turn, participants are required to keep their posts as short and sweet as possible. **3-4 sentences is the requested maximum per turn**. This is to make it easier for the GM to tailor responses to each action, as reading multiple paragraphs at a time becomes cumbersome and causes enormous slow-down in event speed.\n\nFor in-game events, you may simply enter your command here and post your action in in-game channels. For Discord-based events, you may instead include your action description/emote in the same post as your action command.\n\nYou may now join the fight! Use the command: \`/actions YOURNAME join battle ${index}\` to enter combat.\n\n\`\`\`Combat will begin shortly!\`\`\``;
                var gm_msg = `\`\`\`Combat has been declared by ${message.author.username}\nInstance: ${index}\nChannel: ${chnnl}\nStage: Join Battle\nState: Active\nRound: 0\`\`\``;
                var msg_id;
                channels[chnnl].send(opening);
                channels.gm_log.send(gm_msg).then((newMessage) => {msg_id = newMessage.id});
                var combatprops = {
                  join_battle: [],
                  mob_list: [],
                  mobs: {},
                  turn_order: [],
                  remaining: [],
                  skipped: [],
                  defense: [],
                  damage: [],
                  no_cover: [],
                  incap: [],
                  withdrawn: [],
                  stage: "Join Battle",
                  state: "setup",
                  round: 0,
                  channel: chnnl,
                  gm_msg: msg_id,
                  gm_id: message.author.id,
                  round_warning: "no",
                  participants: {}
                };
                combat.properties.push(combatprops);
                return scripts.dbwrite([combat]);
              };

        var instance = args.shift();
        instance = parseInt(instance);
        var [state, files] = await scripts.filepull(['combat']);
        if (state === 0) return message.channel.send(``);
        var combat = files[0];
        var combat_info = combat.properties[instance];

          if (branch === 'start'){//gm combat start instance
            var combat_info = combat.properties[instance];
            if (combat_info.state != 'setup') return message.channel.send(``);
            combat_info.state = 'active';
            combat_info.stage = 'action';
            combat_info.round = 1;
            var turns = combat_info.join_battle.sort(function(a, b) {
              return b[0] - a[0];
            });
            turns.forEach(x => combat_info.turn_order.push(x[1]));
            combat_info.remaining = combat_info.turn_order;
            combat_info.turn_order.forEach(x => combat_info.participants[x] = 5);
            var [state, firstuser] = await scripts.filepull([combat_info.turn_order[0]]);
            var ondeck = client.users.get(firstuser[0].userid);
            var turnorder = combat_info.turn_order.join(' | ');
            var startmsg = `\`\`\`End Join Battle\`\`\`\n\n**Combat is now starting!** Late-comers to combat will be automatically added to the end of the turn order.\n\n__**The turn order is as follows:**__\n\n${turnorder}\n\n__**The following actions can be taken (exclude the brackets!):**__\n\n**Attack:** \`/action YOURNAME attack [stat] Target\` - Attacks the identified target using the indicated stat. Eligible stats: STR | DEX | STA | PER | INT | CHA\n **Defend:** \`/action YOURNAME defend [stat] Target\` - Defends the identified target using the indicated stat. Eligible stats: STR | DEX\n**Heal:** \`/action YOURNAME heal [stat] Target\` - Heals the identified target(s) using the indicated stat. Eligible stats: PER | INT | CHA\n**Support:** \`/action YOURNAME support [action] Target\` - Buffs the identified target's next use of the indicated action. Eligible actions: Attack | Defend | Heal\n**Charge:** \`/action YOURNAME charge [action]\` - Adds bonus dice to the indicated action to be used on the next round. Eligible actions: Attack | Defend | Heal\n**Stealth:** \`/action YOURNAME stealth\` - The character enters stealth. Attacks and investigations launched from Stealth are granted bonuses.\n**Skip:** \`/action YOURNAME skip\` Skips your turn and adds you to the end of the turn order to be called again later in the round. You may only skip your turn **once** per round, and you may not skip if you have already acted.\n**Withdraw:** \`/action YOURNAME withdraw\` Removes you from the combat instance. Further involvement in combat requires a new Join Battle command.\n**End Turn:** \`/action YOURNAME end turn\` Ends your turn for the round without using up any further action points. Does not allow you to act later in the round.\n\nFor detailed information about what actions are available, use the command \`/help Combat\` to receive a DM with the above information and more detailed explanations. Special skills are not yet available, but will be included in a future update.\n\n\`\`\`BEGIN!\`\`\``;
            var firstmsg = `${ondeck} **${firstuser[0].label}**is now up! You currently have ${combat_info.participants[combat_info.remaining[0]]} action points available to spend. For a list of all available actions, use the command \`/help combat\`.`;
            var gm_msg = channels.gm_log.fetchMessage(combat_info.gm_msg);
            channels[combat_info.channel].send(startmsg);
            combat[instance] = combat_info;
            scripts.dbwrite([combat]);
            return channels[combat_info.channel].send(firstmsg);
          };
          if (branch === 'end'){//gm combat end instance

          };
          if (branch === 'skip'){//gm combat skip instance
            var skipped = combat_info.remaining[0];
            var skipstate = combat_info.skipped.indexOf(skipped);
            if (skipstate === -1) combat_info.skipped.push(skipped);
            var [state, [skippedfile]] = await scripts.filepull([skipped]);
            var skipmsg;
            var skippeduser = client.users.get(skippedfile.userid);
            if (skipstate === -1) skipmsg = ` ${skipped} will be called again at the end of the round with anyone else whose turn was skipped.`;
            if (skipstate > -1) skipmsg = ` ${skipped} was already skipped once during the round, so they will be able to act again on their turn in the next round.`;
            var msg = `${skippeduser} The GM has skipped ${skipped} in the turn order and has moved to the next person.${skipmsg}`;
            channels[combat_info.channel].send(msg);
            combat[instance] = combat_info;
            return scripts.next_turn(client, channels, combat, instance);
          };
          if (branch === 'advance'){//gm combat advance instance

          };
          if (branch === 'suspend'){//gm combat suspend instance

          };
          if (branch === 'resume'){//gm combat resume instance

          };
          if (branch === 'remove'){//gm combat remove instance Target

          };
          if (branch === 'add'){//gm combat add instance mobname combatlabel
            var mobname = args.shift();
            var combat_label = args.shift();
            var moblabels = Object.keys(combat_info.mobs).join(', ');
            if (Object.keys(combat_info.mobs).findIndex(x => x === combat_label) != -1) return message.channel.send(`There is already a mob using that combat label, please choose another and try again. The current mob labels are: ${moblabels}.`);
            var [state, files] = await scripts.filepull([mobname]);
            var mobfile = files[0];
            var mob_props = {
              hp: parseInt(mobfile.properties.hp),
              attack: mobfile.properties.attack,
              defense: mobfile.properties.defense,
              heal: mobfile.properties.heal,
              buff: mobfile.properties.buff,
              social: mobfile.properties.social,
              stealth: mobfile.properties.stealth,
              damage: mobfile.properties.damage,
              action_default: mobfile.properties.action_default,
              action_points: 5,
              lines: mobfile.properties.lines,
              exceptions: [],
              status: 'active'
            };
            combat_info.mobs[combat_label] = mob_props;
            combat_info.mob_list.push(combat_label);
            combat.properties[instance] = combat_info;
            scripts.dbwrite([combat]);
            message.channel.send(`${combat_label} has been successfully added to the mob list for combat instance ${instance}.`);

          };
          if (branch === 'exception'){// /gm combat exception instance combatlabel Name1 Name2 Name3....
            var mobname = args.shift();
            var combat_label = args.shift();
            args.forEach(function(name){
              combat_info.mobs[combat_label].exceptions.push(name);
            });
            var exceptions = [...new Set(combat_info.mobs[combat_label].exceptions)];
            var exceptionslist = exceptions.join(', ');
            combat_info.mobs[combat_label].exceptions = exceptions;
            combat[instance] = combat_info;
            scripts.dbwrite([combat]);
            return message.channel.send(`The following exceptions are active for ${combat_label}: ${exceptionslist}`);
          };
    };
  }
  
  resolve();
  
}