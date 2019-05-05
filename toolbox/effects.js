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
  
  apply: async function(target, parameters){
    
  }
  
}