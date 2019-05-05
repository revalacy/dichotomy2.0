exports.run = (client, message, args) => {
    var roll = Math.floor(Math.random() * 1000);
    var msg = `Random! ${message.author} rolled a ${roll}.`;
    message.channel.send(msg);
  }