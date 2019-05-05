const async = require('async');
const scripts = require('../toolbox/scripts.js');

exports.run = (client, message, args) => {
    async function resolve(){
    var testnames = ['Test', 'Double Test'];
    var [state, testrun] = await scripts.filepull(testnames);
    if (state === 0) return message.channel.send(`The following searches could not be completed: ${testrun}`);
    }
    resolve();
}
  