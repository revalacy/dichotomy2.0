exports.run = (client, message, args) => {
    var flip = Math.floor(Math.random() * 10);
    var outcome;
    if (flip < 5) outcome = 'tails';
    if (flip > 4) outcome = 'heads';
   var msg = `${message.author} flips a coin! It came up **${outcome}**.`;
   message.channel.send(msg);
 }