const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, [name, subcommand, target, ...args], channels) => {
    var madness = {};
    const stagemin = [0, 10, 50, 75, 90, 100, 150];
    const stagemax = [9, 49, 76, 89, 99, 149, 250];
    const rollmin = [3, 5, 6, 7, 8, 9, 9];

    async function resolve(){
       var [success, [file]] = await scripts.filepull([name]);
       if (success === 0) return message.channel.send(`A file could not be found for ${name}, please check the spelling and try again.`);
       if (message.author.id != file.userid) return message.channel.send(`You are not the listed owner of ${name}. The command has been terminated.`);
      if (file.isupdated === '0' || file.isupdated === 0) return message.channel.send(`${name} has not yet been updated in the system. To update the character, navigate to this page: http://www.network-rp.com/chargen/${file.objectid}`);

       if (subcommand === 'sanity'){
        var count = parseInt(file.properties.madness.pending);
         if (!file.properties.madness.pending) count = 0;
        if (count === 0 ) return message.channel.send(`You have already used up all of your alotted sanity checks or passive points. One new allowance is generated each day.`);
        var rollarray = [];
        var threshold = await stagecheck(file);
        var newpoints = 0;
        for (var i = 0; i < count; i++){
            var roll = Math.floor(Math.random() * 10) + 1;
            rollarray[i] = `${roll} v ${threshold}`;
            if (roll < threshold) newpoints += 1;
        };
        var rollstring = rollarray.join(' | ');
        var msg = `**${file.nickname}** rolls a sanity check! ${newpoints} points of madness are taken. **[${rollstring}]**`;
        message.channel.send(msg);
        file.properties.madness.points = +file.properties.madness.points + newpoints;
        file.properties.madness.pending = 0;
        return scripts.dbwrite([file]);
       };
      
      if (subcommand === 'passive'){
        var count = parseInt(file.properties.madness.pending);
         if (!file.properties.madness.pending) count = 0;
        if (count === 0 ) return message.channel.send(`You have already used up all of your alotted sanity checks or passive points. One new allowance is generated each day.`);
        var msg = `**${file.nickname}** has taken 1 point of Madness passively.`;
        message.channel.send(msg);
        file.properties.madness.points = +file.properties.madness.points + 1;
        file.properties.madness.pending = parseInt(file.properties.madness.pending) - 1;
        return scripts.dbwrite([file]);
      };
      
      if (subcommand === 'dose'){
        var msg = `**${file.nickname}** has ingested a dose of Elysian tonic.`;
        message.channel.send(msg);
        file.properties.madness.points = +file.properties.madness.points + 3;
        return scripts.dbwrite([file]);
      };
      
      if(subcommand === 'willpower'){
        var msg = `**${file.nickname}** has spent 1 point of willpower to negate a point of Madness!`;
        message.channel.send(msg);
        file.properties.madness.points = +file.properties.madness.points - 1;
        var [willpower, wpmax] = file.properties.stats.wp.split('/');
        var wp = +willpower - 1;
        file.properties.stats.wp = `${wp}/10`;
        var stage = parseInt(file.properties.madness.stage);
        if (file.properties.madness.points < stagemin[stage]) file.properties.madness.stage = stage - 1;
        return scripts.dbwrite([file]);
      };
      if(subcommand === 'accept'){
        if (file.properties.madness.accepted === 'TRUE') return message.channel.send(`${name} has already accepted their Madness!`);
        var statemsg = ``;
        if (!file.properties.madness.first) {
          file.properties.madness.points = parseInt(file.properties.madness.points);
          file.properties.madness.first = new Date();
          statemsg = ` One point of Madness has been added.`;
        };
        var msg = `${name} has chosen to accept Madness!${statemsg} You may find your mind connects to others who have embraced the Madness. Tread with caution.`;
        var parentmsg = `${name} has chosen to accept the Madness in their soul. They have been removed from the Madness shit-list.`;
        file.properties.madness.accepted = 'TRUE';
        file.properties.madness.shitlist = 'FALSE';
        message.author.send(msg);
        channels.mom.send(parentmsg);
        channels.dad.send(parentmsg);
        return scripts.dbwrite([file]);
      };
      if(subcommand === 'reject'){
        if (file.properties.madness.accepted === 'FALSE') return message.channel.send(`${name} has already rejected their Madness!`);
        var msg = `${name} has rejected Madness! Be warned that simply rejecting Madness does not cure you of it, and you will be targeted by those loyal to the Dowager. Tread with caution.`;
        var parentmsg = `${name} has **rejected** Madness! Foolish child. They have been added to the shit-list.`;
        file.properties.madness.accepted = 'FALSE';
        file.properties.madness.shitlist = 'TRUE';
        message.author.send(msg);
        channels.mom.send(parentmsg);
        channels.dad.send(parentmsg);
        return scripts.dbwrite([file]);
      };
      if(subcommand === 'exposure'){
        
      };
    }

    
  
  resolve();


  async function stagecheck (a) {
      var userfile = a;
      var index = 0;
      for (var n = 0; n < 7; n++){
        if (userfile.properties.madness.points >= stagemin[n] && userfile.properties.madness.points < stagemax[n]) index = n;
      };
      return new Promise(resolve => {resolve(rollmin[index])});
  }
}