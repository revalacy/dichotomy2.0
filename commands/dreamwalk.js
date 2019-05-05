const scripts = require('../toolbox/scripts.js');
exports.run = (client, message, [name, target, subcommand, ...args], channels) => {
   
  async function resolve(){
      if (!name) return message.channel.send(`To begin a dreamwalk, the aggressor must use the command: \`/dreamwalk Name Target initiate\` in the Madness Rolls channel.`);
      var [state, files] = await scripts.filepull([name, target, 'dreamwalk']);
      if (state === 0) return message.channel.send(`A file could not be found with ${files}. Please check your spelling and try again.`);
      var [actorfile, targetfile, dreamfile] = files;
    if (actorfile.isupdated === '0' || actorfile.isupdated === 0) return message.channel.send(`${name} has not yet been updated in the system. To update the character, navigate to this page: http://www.network-rp.com/chargen/${actorfile.objectid}`);
    var filename;
    var msg;
      var filenameA = `${name}_${target}`;
      var filenameB = `${target}_${name}`;
      if (!dreamfile.properties[filenameA] && !dreamfile.properties[filenameB] && !args) return message.channel.send(`To begin a dreamwalk, the aggressor must use the command: \`/dreamwalk Name Target initiate\` in the Madness Rolls channel.`);
      var warning;
      if (dreamfile.properties[filenameB]){
        warning = dreamfile.properties[filenameB].warning;
        filename = filenameB;
      };
      if (dreamfile.properties[filenameA]){
        warning = dreamfile.properties[filenameA].warning;
        filename = filenameA;
      };
    console.log(filename);
    if (!filename && subcommand != 'initiate') return message.channel.send(`To begin a dreamwalk, the aggressor must use the command: \`/dreamwalk Name Target initiate\` in the Madness Rolls channel.`);
      if (subcommand === 'initiate'){
        if (+targetfile.properties.madness.points < 1) return message.channel.send(`${target} does not have any Madness points! You will not be able to initiate this dreamwalk until ${target} gains some Madness.`);
        if(dreamfile.properties[filenameB] || dreamfile.properties[filenameA]) {

          if(warning === 0 || warning === '0') {
            dreamfile.properties[filename].warning = 1;
            return message.channel.send(`If you initiate a second dreamwalk, your previous one will be deleted. If you wish to proceed, enter the command again.`);
          };
          delete dreamfile.properties[filename];
        };
        filename = filenameA;
        dreamfile.properties[filename] = {
          aggressor: name,
          target: target,
          state: 'pending wagers',
          warning: 0
        };
        dreamfile.properties[filename][name] = {
            rolls: [],
            advantage: 0,
            total: 0,
            wager: 'Pending.',
            accepted: 0
        };
        dreamfile.properties[filename][target] = {
            rolls: [],
            advantage: 0,
            total: 0,
            wager: 'Pending.',
            accepted: 0
        };
        scripts.dbwrite([actorfile, targetfile, dreamfile]);
        return channels.madrolls.send(`The dreamwalk between ${name} and ${target} has been initiated!\n\nDreamwalks must have some OOC agreement before your RP can begin. Using the bot commands, both parties must first make their wagers (you'll probably want to do that in DMs to avoid spoilers) by using the command \`/dreamwalk Name Target wager Your wager goes here.\`\n\nYour dreamwalk RP can happen in any RP channel you choose, but rolls must take place here. Once both parties have submitted their wagers for the contest, you need only use the command \`/dreamwalk Name Target\` and your battle will begin.\n\nThe first to maintain advantage for **3 consecutive turns**, or whoever maintains the greatest number of successes total after 10 rounds if advantage is not maintained, will win the contest and their dreamwalk wager will be imposed on the loser. ${client.users.get(actorfile.userid)} and ${client.users.get(targetfile.userid)}, you may now submit your wagers!`);
      };
      if (subcommand === 'wager'){
        var wager = args.join(' ');
        if (!wager || wager === '') {
          message.author.send(`Currently, the wagers entered are: \n\n **${name}:** ${dreamfile.properties[filename][name].wager}\n**${target}:** ${dreamfile.properties[filename][target].wager}\n\n-----------------------------------`);
          return channels.madrolls.send(`Current wagers have been sent to your DMs. Once you have reviewed the wagers and no further changes are needed, both parties must enter the command \`/dreamwalk Name Target accept\` and the dreamwalk will commence.`);
        };
          if (message.channel.type != 'dm') {
            message.delete();
            message.channel.send(`Pssst! You shouldn't show off your wager here! Don't worry I saved it.`);
          };
          dreamfile.properties[filename][name].wager = wager;
          console.log(dreamfile.properties[filename][name].wager);
          dreamfile.properties[filename][name].accepted = 0;
          dreamfile.properties[filename][target].accepted = 0;
          msg = `${name} has submitted a new wager for the contest! Once you have reviewed the wagers and no further changes are needed, both parties must enter the command \`/dreamwalk Name Target accept\` and the dreamwalk will commence.\n\nCurrently, the wagers entered are: \n\n**${name}:** ${dreamfile.properties[filename][name].wager}\n**${target}:** ${dreamfile.properties[filename][target].wager}\n\n------------------------------------------`;
        scripts.dbwrite([actorfile, targetfile, dreamfile]);
        message.author.send(msg);
        client.users.get(targetfile.userid).send(msg);
        return channels.madrolls.send(`${name} has submitted a new wager for the contest! Once you have reviewed the wagers and no further changes are needed, both parties must enter the command \`/dreamwalk Name Target accept\` and the dreamwalk will commence.`);
      };
    if(subcommand === 'accept'){
      if (dreamfile.properties[filename][target].wager === '') return message.channel.send(`${target} has not yet submitted their wager. Please wait for both parties to submit before accepting the terms.`);
      if (dreamfile.properties[filename][name].wager === '') return message.channel.send(`You need to submit a wager for ${name} first!`);
      dreamfile.properties[filename][name].accepted = 1;
      var ready = 0;
      if (parseInt(dreamfile.properties[filename][name].accepted) === 1) ready += 1;
      if (parseInt(dreamfile.properties[filename][target].accepted) === 1) ready += 1;
      console.log(ready);
      if (ready === 1) {
        scripts.dbwrite([actorfile, targetfile, dreamfile]);
        return message.channel.send(`${name} has accepted the terms of the dreamwalk. Once ${target} has accepted, the dreamwalk may commence.`);
      };
      if (ready === 2) {
        dreamfile.properties[filename].state = 'active';
        var victim = targetfile;
        var aggressor = actorfile;
        if (name === dreamfile.properties[filename].target){
            victim = actorfile;
            aggressor = targetfile;
            };
        aggressor.properties.madness.points = parseInt(aggressor.properties.madness.points) + 9;
        message.channel.send(`${dreamfile.properties[filename].aggressor} drinks three doses of tonic. Upon laying down, they drift off to sleep and slip silently into ${dreamfile.properties[filename].target}'s dreams.\n\n\nBoth parties have accepted the terms of the dreamwalk! Let the chaos commence!`);
        return scripts.dbwrite([aggressor, victim, dreamfile]);
      };
    };
    if(dreamfile.properties[filename][name].wager === '' || dreamfile.properties[filename][target].wager === '') return message.channel.send(`Wagers are still missing!`);
    if (dreamfile.properties[filename][name].rolls.length > dreamfile.properties[filename][target].rolls.length + 1) return message.channel.send(`You need to wait for your opponent to roll, first.`);
    if (dreamfile.properties[filename].state === "pending wagers") return message.channel.send(`At least one wager is missing! Make sure both wagers are entered before proceeding to the Dreamwalk. Once both wagers are entered, the Dreamwalk will start.`);
    if (dreamfile.properties[filename].state === "complete") return message.channel.send(`Your dreamwalk has already ended! If you wish to start a new one against ${target}, use the command \`/dreamwalk Name Target initiate\``);
    if (message.channel.id != channels.madrolls.id) return message.channel.send(`All Dreamwalk rolls must be made in the ${channels.madrolls} channel!`);
    var dicepool = parseInt(actorfile.properties.stats.resolve) + parseInt(actorfile.properties.stats.cha);
    var [successes, rolls, botches] = await scripts.roll(dicepool, name);
    var botchstring = ``;
    if (botches > 0) botchstring = ` and ${botches} botches`;
    dreamfile.properties[filename][name].rolls.push(successes);
    console.log(dreamfile.properties[filename][name].rolls);
    dreamfile.properties[filename][name].total = parseInt(dreamfile.properties[filename][name].total) + successes;
    console.log(dreamfile.properties[filename][name].total);
    
    if (dreamfile.properties[filename][name].rolls.length != dreamfile.properties[filename][target].rolls.length) msg = `${name} rolled for the dreamwalk against ${target} and got ${successes} successes${botchstring} on ${dicepool} dice. **[${rolls}]**`;
    console.log(msg);
    
    if (dreamfile.properties[filename][name].rolls.length === dreamfile.properties[filename][target].rolls.length) {
      var index = dreamfile.properties[filename][name].rolls.length - 1;
      var actorval = parseInt(dreamfile.properties[filename][name].rolls[index]);
      var targetval = parseInt(dreamfile.properties[filename][target].rolls[index]);
      if (actorval > targetval) {
        dreamfile.properties[filename][name].advantage = parseInt(dreamfile.properties[filename][name].advantage) + 1;
        dreamfile.properties[filename][target].advantage = 0;
        msg = `${name} rolled for the dreamwalk against ${target} and got ${successes} successes${botchstring} on ${dicepool} dice. **[${rolls}]**\n\n${name} has won advantage for this round! Advantage is currently:\n\n**${name}:** ${dreamfile.properties[filename][name].advantage}\n**${target}:** ${dreamfile.properties[filename][target].advantage}\n\n**Round:** ${dreamfile.properties[filename][name].rolls.length}`;
      };
      if (targetval > actorval) {
        dreamfile.properties[filename][target].advantage = parseInt(dreamfile.properties[filename][target].advantage) + 1;
        dreamfile.properties[filename][name].advantage = 0;
        msg = `${name} rolled for the dreamwalk against ${target} and got ${successes} successes${botchstring} on ${dicepool} dice. **[${rolls}]**\n\n${target} has won advantage for this round! Advantage is currently:\n\n**${target}:** ${dreamfile.properties[filename][target].advantage}\n**${name}:** ${dreamfile.properties[filename][name].advantage}\n\n**Round:** ${dreamfile.properties[filename][name].rolls.length}`;
      };
      if (actorval === targetval){
        dreamfile.properties[filename][name].advantage = 0;
        dreamfile.properties[filename][target].advantage = 0;
        msg = `${name} rolled for the dreamwalk against ${target} and got ${successes} successes on ${dicepool} dice.\n\nThis round is a draw! Advantage has been reset.\n\n**Round:** ${dreamfile.properties[filename][name].rolls.length}`;
      };
      if(parseInt(dreamfile.properties[filename][name].advantage) === 3){
        dreamfile.properties[filename].state = 'complete';
        var winningwager = dreamfile.properties[filename][name].wager;
        msg += `\n\n\n**${name}** has won the dreamwalk! Having maintained advantage for 3 consecutive rounds, ${target} is now subject to ${name}'s wager. See your DMs for details.`;
        client.users.get(targetfile.userid).send(`${target} lost the dreamwalk! You will now be subjected to ${name}'s wager: ${winningwager}`);
      };
      if(parseInt(dreamfile.properties[filename][target].advantage) === 3){
        dreamfile.properties[filename].state = 'complete';
        var winningwager = dreamfile.properties[filename][target].wager;
        msg += `\n\n\n**${target}** has won the dreamwalk! Having maintained advantage for 3 consecutive rounds, ${name} is now subject to ${target}'s wager. See your DMs for details.`;
        client.users.get(actorfile.userid).send(`${name} lost the dreamwalk! You will now be subjected to ${target}'s wager: ${winningwager}`);
      };
      if (dreamfile.properties[filename][name].rolls.length === 10 && dreamfile.properties[filename][target].rolls.length === 10) {
        dreamfile.properties[filename].state = 'complete'
        var actortotal = parseInt(dreamfile.properties[filename][name].total);
        var targettotal = parseInt(dreamfile.properties[filename][target].total);
        var winner;
        var loser;
        if (actortotal > targettotal) {
            winner = actorfile; 
            loser = targetfile;
        };
        if (actortotal < targettotal) {
            winner = targetfile;
            loser = actorfile;
        };
        var winningwager = dreamfile.properties[filename][winner.label].wager;
        var msg = `After 10 rounds of dream battling, ${winner.label} has won the dreamwalk against ${loser.label} with ${dreamfile.properties[filename][winner.label].total} total successes vs ${loser.label}'s ${dreamfile.properties[filename][loser.label].total} successes. ${loser.label} will now be subjected to ${winner.label}'s wager.`;
        client.users.get(loser.userid).send(`${loser.label} lost the dreamwalk! You will now be subjected to ${winner.label}'s wager: ${winningwager}`);
      };
      
    };
    message.channel.send(msg);
    return scripts.dbwrite([actorfile, targetfile, dreamfile]);
  }
  
  resolve();
}