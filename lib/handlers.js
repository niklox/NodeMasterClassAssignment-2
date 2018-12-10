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
  // Check that the phonenumber exists
  let phone = typeof(data.queryStringObject.phone) && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
  if(phone){
    // Get the user
    _data.read('users',phone, (err,data) => {
      if(!err && data){
        // Remove the hashed password before returning it
        delete data.hashedPassword;
        callback(200,data);
      }else{
        callback(404);
      }
    });
  }else{
    callback(400,{'Error':'Missing required field'});
  }
};

// Users put
// Required data: phone
// Optional data: firstName, lastName, password (at least one musst be here)
// @TODO Only let authenticated users update their own object
handlers._users.put = (data,callback) => {
  // Check for the required field
  let phone = typeof(data.payload.phone) && data.payload.phone.trim().length == 10 ? data.payload.phone : false;
  // Check for the optional fields
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  // Error if the phone is invalid
  if(phone){
    if(firstName || lastName || password){
      // Lookup the user
      _data.read('users',phone, (err,userData) => {
        if(!err && userData){
          //Update the user
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the ew updates
          _data.update('users',phone,userData, () =>{
            if(!err){
              callback(200);
            }else{
              console.log(err);
              callback(500, {'Error':'Could not update the file'})
            }
          });
        }else{

        }
      });
    }else{
      callback(400,{'Error':'Missing fields to update'});
    }
  }else{
    callback(400,{'Error':'Missing required field'});
  }
};

// Users delete
// Required fields: phone
// @TODO: Only let an authenticated user delete their own object
// @TODO: Cleanup (delete) any other datafiles associated with this user
handlers._users.delete = (data,callback) => {
  // Check that the phone number is valid
  let phone = typeof(data.queryStringObject.phone) && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
  if(phone){
    // Get the user
    _data.read('users',phone, (err,data) => {
      if(!err && data){
        _data.delete('users',phone, (err) => {
          if(!err){
            callback(200);
          }else{
            callback(500,{'Error':'Could not delete the user'});
          }
        });
      }else{
        callback(400,{"Error":"Could not find the specified user"});
      }
    });
  }else{
    callback(400,{'Error':'Missing required field'});
  }

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
