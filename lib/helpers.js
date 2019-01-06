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

// Create a string with random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // The string
    let str = '';
    for(i = 0; i <= strLength; i++){
      // Get a random character from the possible characters string
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Add it to the final str
      str += randomCharacter;
    }

    // Return the final string
    return str;

  }else{
    return false;
  }
};

module.exports = helpers;
