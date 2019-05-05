exports.run = (client, message) => {
  
 
  var user = message.author.id;
  if (user != '106481950499282944' && user != '142847091411124225') return message.channel.send(`**YOU'RE NOT THE BOSS OF ME!!!!!!!!1!**`);
  var img1 = 'https://cdn.discordapp.com/attachments/175762123677368321/538548028303212546/tumblr_inline_ottjqjbIJZ1t9mqf1_1280.gif';
  var img2 = 'https://cdn.discordapp.com/attachments/175762123677368321/538548031440814090/tumblr_inline_ottjnjLurQ1t9mqf1_1280.gif';
  var img3 = 'https://cdn.discordapp.com/attachments/175762123677368321/538548032191463445/tumblr_inline_ottjn6ikH31t9mqf1_1280.gif';
  var video = 'https://www.youtube.com/watch?v=3UnK5rw_6hM';
  var msgs = [img1, img2, img3, video];
  
  function resolve() {
    messagehandler(msgs);
  }
  
  resolve();
  
  async function messagehandler (a){
    var msgarray = a;
    var timeoutstack = []
    function doSetTimeout(i) {
    setTimeout(function() { 
      if (i === 3) message.channel.send(msgarray[i]);
      if (i < 3) message.channel.send({files: [msgarray[i]]});
    }, timeoutstack[i]);
    }
    for (var i = 0; i < msgarray.length; i++){
     timeoutstack[i] = 1000 * i;
     doSetTimeout(i);
    }}
}