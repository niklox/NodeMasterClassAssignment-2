/*
 * Helpers for many tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

// Container for all the helpers

const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
    return hash;
  }else{
    return false;
  }
};

// parse a JSON string ti an object in all cases
helpers.parseJsonToObject = (str) => {
  try{
    var obj = JSON.parse(str);
    return obj;
  }catch(e){
    return{};
  }
};

module.exports = helpers;
