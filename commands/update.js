const scripts = require('../toolbox/scripts.js');
const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../client_secret.json');
    const database = new GoogleSpreadsheet('1VSUPYWzYUgslSK0vQEe-Wh1DD-SwUEmc-Mi7lA-9S8A');//PROD Database
      database.useServiceAccountAuth(creds, function (err) {
        if (err)
        console.log(err)});

exports.run = (client, message, [name, ...args]) => {
  var user = message.author;
  var channel = message.channel;
 
  
  async function resolve(){
    if (name){ 
    var id = await userpull(name);
    user = client.users.get(id);
                 };
    var records = await filepull(user.id);
    var url = `http://network-rp.com/charactergen/`;
    var urlarray = [];
    var count = 0;
    for (var i = 0; i < records.length; i++){
      if (records[i].isupdated === '1') {
        urlarray[i] = `${records[i].label}: Update completed.`;
        continue;
      };
        urlarray[i] = `${records[i].label}: ${url}${records[i].objectid}`;
        count += 1;
    };
    var characterstring = urlarray.join('\n');
    var msg = `This is a message from the GN Character Update system! We are facilitating this change to balance the existing event system mechanics and offer more stats customization to players, as well as making it easier to manage your characters. During the downtime, the GM team made some adjustments to rebalance the new system, so all stats have been reset.\n\nYou have **${count}** characters waiting to be updated to the new system. At your earliest convenience, please follow the links below to update each of your characters. If you run into any errors during the update process, please alert Enambris ASAP. If you have questions about what each stat does, hover over the '?' beside the field in question. Happy updating!\n\n${characterstring}`;
    if(count === 0 && !name) return message.channel.send(`Your updates are already finished! If you want to make a new character, you can go to http://network-rp.com/mystuff and select New Character.`);
    if(count === 0 && name) return message.channel.send(`${name} has already finished all of their updates.`);
    user.send(msg);
  }
  
  async function filepull(a){
    var searchkey = a;
     return new Promise(resolve => {
       database.getRows(1, {'query': `userid = "${searchkey}" | userid = ${searchkey}`}, function(err, rows){
         if (!rows.length || rows.length === 0) return console.log(`An error occurred in the process, no records were pulled for ${searchkey}.`);
         resolve(rows);
     }); 
     });
  }
  
  async function userpull(a){
    var searchkey = `label = "${a}"`;
     return new Promise(resolve => {
       database.getRows(1, {'query': searchkey}, function(err, rows){
         resolve(rows[0].userid);
       });
     });
  }
  
  resolve();
}