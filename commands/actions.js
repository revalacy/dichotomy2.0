const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [name, subcommand, target, ...args], channels) => {// /actions Name Subcommand Target ...Arguments
var user = message.author;
  if (!name || !subcommand || !target) return message.channel.send(`Your command is missing arguments! Action commands are structured: \`/actions Name subcommand target\`.`);
  
  async function resolve() {
    if (subcommand === "attack"){// /actions Name attack Target stat
      const stats = ['str', 'strength', 'dex', 'dexterity', 'sta', 'stamina', 'per', 'perception', 'int', 'intelligence', 'cha', 'charisma'];
      var [state, files] = scripts.filepull([name, 'combat']);
      if (state === 0) return message.channel.send(`Failed to pull files, please check your spelling and try again.`);
      var [character, combat] = files;
      if (character.properties.active_combat === 'none') return message.channel.send(`You are not in any active combat instances.`);
      var instance = parseInt(character.properties.active_combat);
      var combat_info = combat[instance];
      if (combat_info.remaining[0] != name) return message.channel.send(`It's not your turn to act! Please wait for your turn.`);
      var action_points = parseInt(combat_info.participants[name]);
      var cost = 3;
      var remaining = action_points - cost;
      if (remaining < 0) return message.channel.send(`You don't have enough action points remaining to attack. You can choose another action or end your turn with the command \`/actions ${name} end turn\`.`);
      combat_info.participants[name] = remaining;
      var stat = args[0];
      if (!stat || stats.indexOf(stat) === -1) stat = character.properties.stats.combat_stat;
      if (message.author.id != character.userid) return message.channel.send(``);
      var dicepool = parseInt(character.properties.stats.martial) + parseInt(character.properties.stats[stat]) + parseInt(character.properties.bonus.martial) + parseInt(character.properties.bonus[stat]);
      var [successes, rolls, botches] = scripts.roll(dicepool, character.label);
      if (successes < 1) return channels[combat_info.channel].send(``);
      var dmgpool = parseInt(character.properties.stats.damage) + parseInt(character.properties.stats[stat]) + parseInt(character.properties.bonuses.damage);
      character.properties.bonuses.damage = 0;
      var attackinfo = [name, successes, rolls, dmgpool];
      if (combat_info.mob_list.indexOf(target) != -1){
        return scripts.mobdefense(client, channels, target, attackinfo, instance);
      };
      var [state, files] = await scripts.filepull([target]);
      var targetfile = files[0];
      targetfile.properties.attacks.push(attackinfo);
      var msg = `${character.nickname} has launched an attack against ${targetfile.nickname}`;
      return;
    };
    if (subcommand === "defend"){// actions Name defend Target stat
      
      return;
    };
    if (subcommand === "heal"){

      return;
    };
    if (subcommand === "buff"){

      return;
    };
    if (subcommand === 'revive'){

      return;
    };
    if (subcommand === 'end' || subcommand === 'endturn'){

      var [state, files] = scripts.filepull([name, 'combat']);
      if (state === 0) return message.channel.send(`Failed to pull files, please check your spelling and try again.`);
      var [character, combat] = files;
      var instance = parseInt(character.properties.active_combat);
      if (combat[instance].remaining[0] != name) return message.channel.send(`It is not currently your turn to act.`);
      return scripts.next_turn(client, channels, combat, instance);
    };


    if (subcommand === "investigate"){
        var now = new Date();//create timestamp of current investigation
        var searches = [name, target];//prep searches for file pulls
        var keywords = args;
      console.log(keywords);
        var [state, files] = await scripts.filepull(searches);//pull both files
        var cooldown = 60000 * 20;

        //Run checks to verify the user can proceed
        if (state === 0) return message.channel.send(`A file could not be found for ${files}. Please check your spelling and try the command again.`);
        var [character, targetfile] = files;
        //Ownership check
        if(character.userid != message.author.id) return message.channel.send(`You may not use someone else's character. If you believe this message is in error, please reach out to an admin.`);
        //updated character check
        if (character.isupdated === 0 || character.isupdated === "0") return message.channel.send(`${character.nickname} has not yet been updated. Please update your character files and try again.`);
        //Clue check
        if (targetfile.secrets.clues.length === 0) return message.channel.send(`There is nothing to learn about ${targetfile.nickname} right now.`);
        //Investigation file check
        if(!targetfile.investigations[name]) targetfile.investigations[name] = {index: 0,successes: 0, cooldown: 0};
        //Cooldown check
        if(targetfile.investigations[name].cooldown != 0){
          var end = new Date(targetfile.investigations[name].cooldown);
          var difference = Math.ceil((end - now)/60000);
          if (difference > 0) return message.channel.send(`${character.nickname} must wait ${difference} more minutes before they can investigate ${targetfile.nickname} again.`);
        };
        //Bonus dice check
        if (!character.properties.bonuses.all) character.properties.bonuses.all = 0;

        //Set investigation state and run checks
        var channelmsg = `${character.nickname} rolls investigation! Take a moment to review your findings.`;
        var searchstate = 'failure';
        if (targetfile.secrets.clues.length < parseInt(targetfile.investigations[name].threshold) ) { 
          message.channel.send(channelmsg)
          return message.author.send(`It looks like ${character.nickname} may have already found everything worth finding out about ${targetfile.nickname} at this time. Check back later to see if more clues may be unearthed..`);
        };
        //You may now proceed to investigate.
        var index = parseInt(targetfile.investigations[character.label].index);
        var clue = targetfile.secrets.clues[index];
        var keybonus = 0;
        for (var i = 0; i < keywords.length; i++){
          var n = targetfile.secrets[clue].keywords.indexOf(keywords[i]);
          if (n > -1) keybonus++;
        };
        var dicepool = parseInt(character.properties.stats.per) + parseInt(character.properties.stats.comprehension) + parseInt(character.properties.bonuses.per) + parseInt(character.properties.bonuses.comprehension) + parseInt(character.properties.bonuses.all);
        var dice = dicepool + keybonus;
        var [successes, rollstring, botches] = await scripts.roll(dice, character.label);

        //check dicepool against threshold for current index
        var threshold = parseInt(targetfile.secrets[clue].threshold);
        targetfile.investigations[character.label].successes = parseInt(targetfile.investigations[character.label].successes) + successes;
        
        if(targetfile.investigations[character.label].successes >= threshold) searchstate = 'success';

        //create Message possibilities
        var messages = {success: `${targetfile.secrets[clue].text}`,
                        failure: `Nothing new stands out to ${character.nickname} in the investigation at this time.`};
        var msg = `${character.nickname} rolled **${dice}** dice **[${dicepool} dicepool + ${keybonus} bonus]** and got **${successes}** successes **[${rollstring}]** to investigate ${targetfile.nickname}.\n\n${messages[searchstate]}`;

        if (searchstate === 'success'){
          cooldown = 60000 * 15;
          targetfile.investigations[character.label].index += 1;
        };

        if (message.channel.type != 'dm') message.channel.send(channelmsg);
        message.author.send(msg);

        if(targetfile.secrets[clue].reveal === 'yes' && searchstate === 'success') {
          channels[targetfile.secrets[clue].reveal_room].send(targetfile.secrets[clue].reveal_text);
          targetfile.secrets.clues.splice(index, 1);
          targetfile.investigations[character.label].index = index;
        };

        
        character.properties.bonuses.per = 0;
        character.properties.bonuses.comprehension = 0;
        character.properties.bonuses.all = 0;
        targetfile.investigations[character.label].cooldown = new Date(now.getTime() + cooldown);
        scripts.dbwrite([character, targetfile]);
    };
    if (subcommand === "inspect"){

    };
    if (subcommand === "stealth"){

    };
    if (subcommand === 'join' || subcommand === 'joincombat' || subcommand === 'joinbattle'){// /actions Name join combat instance
      var instance = args[1];
      if (args[0] != 'combat' && args[0] != 'battle') instance = args[0];
      instance = parseInt(instance);
      var [state, files] = await scripts.filepull([name, 'combat']);
      if (state === 0) return message.channel.send(`File pull failed, please check your spelling and try again.`);
      var [character, combat] = files;
      combat_info = combat.properties[instance];
      if (combat_info.state === 'suspended') return message.channel.send(`That combat instance is currently suspended. You may join that instance once the GM resumes combat.`);
      if (!character.properties.active_combat) character.properties.active_combat = 'none';
      if (character.properties.active_combat != 'none') return message.channel.send(`You are already participating in an active combat instance. You may either withdraw from combat or request that the GM suspend combat until the current event has ended.`);
      character.properties.active_combat = instance;
      if (combat_info.stage != 'Join Battle') {
        combat_info.turn_order.push(character.label);
        combat_info.remaining.push(character.label);
        combat.properties[instance] = combat_info;
        message.channel.send(`**${character.label}** joins the battle! Since combat is already active, they will be added to the end of the current turn order.`);
        return scripts.dbwrite([combat, character]);
      };
      var dicepool = parseInt(character.properties.stats.wits) + parseInt(character.properties.stats.comprehension);
      var [successes, rollstring, botches] = await scripts.roll(dicepool, name);
      var botchstring = ` and ${botches} botches`;
      if (botches === 0) botchstring = ``;
      var initiative = [successes, character.label];
      combat_info.join_battle.push(initiative);
      var msg = `**${character.label}** joins the battle! They rolled ${successes} successes${botchstring}. Turn order will be announced once the battle has begun. **[${rollstring}]**`;
      channels[combat_info.channel].send(msg);
      combat.properties[instance] = combat_info;
      return scripts.dbwrite([character, combat]);
    };
    if (subcommand === 'withdraw'){// /actions Name withdraw
      var [state, files] = await scripts.filepull([name, 'combat']);
      if (state === 0) return message.channel.send(`File pull failed, please check your spelling and try again.`);
      var [character, combat] = files;
      var instance = parseInt(character.properties.active_combat);
      combat_info = combat.properties[instance];
      if (combat_info.stage != 'active') return message.channel.send(`You cannot withdraw from a combat instance unless it is active and the Join Battle phase has ended. Wait for the GM to start combat or request that you be removed. Withdrawing cannot be used to attempt a better Join Battle roll.`);
      character.properties.active_combat = 'none';

    };
  }
  
  resolve();
  
}