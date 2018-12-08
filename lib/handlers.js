/*
 * Request handlers
 *
 */

// Dependencies

const _data = require('./data');
const helpers = require('./helpers');

// Define handlers
const handlers = {};


// Users
handlers.users = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  }else{
    callback(405);
  }
};

// Users submethods
handlers._users  = {};

// Users post
// Required data: Lastname, Firstname, password, tosAgreement
// Optional data: none
handlers._users.post = (data,callback) => {
  // Check that all teh required fields are filled out
 console.log(data.payload.password); //this returns undefined
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
  //console.log(firstName + lastName + phone+ password + tosAgreement);
  if(firstName && lastName && phone && password && tosAgreement){
    // make sure that the user doesn't already existing
    _data.read('users',phone,(err,data) => {
      if(err){
        // Hash the password
        let hashedPassword = helpers.hash(password);
        if(hashedPassword){

          // Create the user object
          let userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };
          // Store the user
          _data.create('users',phone,userObject, (err) => {
            if(!err){
              callback(200);
            }else{
              console.log(err);
              callback(500,{'Error' : 'Could not create the user'});
            }
          });

        }else{
          callback(500,{'Error' : 'Could not hash password'});
        }
      }else{
        callback(400,{'Error':'That phonenumber already exists'});
      }
    });

  }else{
    callback(400,{'Error':'Missing required fields'});
  }
};

// Users - GET
// Required data: phone
// Optional data: none
// @TODO Just let the authenticated users access their own data.
handlers._users.get = (data,callback) => {

};

// Users put
handlers._users.put = (data,callback) => {

};

// Users delete
handlers._users.delete = (data,callback) => {

};





// Ping handler
handlers.ping = (data,callback) => {
  callback(200);
};

// Hello handler
handlers.hello = (data,callback) => {
  callback(406,{'name' : 'Hello Mr! I\'m here ready to rock...'});
};

// Respond to not found requests
handlers.notFound = (data,callback) => {
  callback(404);
};

module.exports = handlers;
