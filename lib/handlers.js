/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define handlers
const handlers = {};

// Users Handler
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

// Users - POST
// Required data: Lastname, Firstname, password, tosAgreement
// Optional data: none
handlers._users.post = (data,callback) => {
  // Check that all the required fields are filled out
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
          _data.create('users',phone,userObject,(err) => {
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
handlers._users.get = (data,callback) => {
  // Check that the phonenumber exists
  let phone = typeof(data.queryStringObject.phone) && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
  if(phone){
    // Get the tokens from the headers
    let token= typeof(data.headers.token) == 'string' ? data.headers.token : false;
    //Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
      if(tokenIsValid){
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
        callback(403,{'Error':'Missing required token in header, or token is invalid'});
      }
    });
  }else{
    callback(400,{'Error':'Missing required field'});
  }
};

// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one musst be here)
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
      // Get the tokens from the headers
      let token= typeof(data.headers.token) == 'string' ? data.headers.token : false;
      //Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
        if(tokenIsValid){

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
              _data.update('users',phone,userData, () => {
                if(!err){
                  callback(200);
                }else{
                  console.log(err);
                  callback(500, {'Error':'Could not update the user'})
                }
              });
            }else{
              callback(400,{'Error':'The user does not exist!'})
            }
          });

        }else{
          callback(403,{'Error':'Missing required token in header, or token is invalid'});
        }
      });
    }else{
      callback(400,{'Error':'Missing fields to update'});
    }
  }else{
    callback(400,{'Error':'Missing required field'});
  }
};

// Users - DELETE
// Required fields: phone
// @TODO: Only let an authenticated user delete their own object
// @TODO: Cleanup (delete) any other datafiles associated with this user
handlers._users.delete = (data,callback) => {
  // Check that the phone number is valid
  let phone = typeof(data.queryStringObject.phone) && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
  if(phone){
    // Get the tokens from the headers
    let token= typeof(data.headers.token) == 'string' ? data.headers.token : false;
    //Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
      if(tokenIsValid){
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
          callback(403,{'Error':'Missing required token in header, or token is invalid'});
      }
    });

  }else{
    callback(400,{'Error':'Missing required field'});
  }
};

// Tokens
handlers.tokens = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._tokens[data.method](data,callback);
  }else{
    callback(405);
  }
};

// Countainer for the tokens submethods
handlers._tokens = {};

// Tokens - POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data,callback) => {
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if(phone && password){
    // Look up the user with the phonenumber
    _data.read('users',phone,(err,userData) => {
      if(!err && userData){
        // Hash the password
        let hashedPassword = helpers.hash(password);
        if(hashedPassword == userData.hashedPassword){
          // Create a new token with a random name. Expiration data 1 hour in the future
          let tokenID = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60;
          let tokenObject = {
            'phone' : phone,
            'tokenID' : tokenID,
            'expires' : expires
          };
          // Store the token
          _data.create('tokens',tokenID,tokenObject,(err) => {
            if(!err){
              callback(200,tokenObject);
            }else{
              callback(500,{'Error':'Could not create a token'});
            }
          });
        }else{
          callback(400,{'Error':'Password did not match the specified user\'s password'});
        }

      }else{
        callback(400, {'Error':'Could not find the specified user'})
      }
    });
  }else{
    callback(400,{'Error': 'Missing required fields'});
  }
};

// Tokens - GET
// Required data: id
// Optional data: none
handlers._tokens.get = (data,callback) => {

  // Check that the id is valid
  let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;
  if(id){
    // Get the token
    _data.read('tokens',id, (err,tokenData) => {
      if(!err && tokenData){
        callback(200,tokenData);
      }else{
        callback(404);
      }
    });
  }else{
    callback(400,{'Error':'Missing required field'});
  }

};

// Tokens - PUT
// Required data: id, extends
// Optional data: none
handlers._tokens.put = (data,callback) => {
  let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend){

    // Look up the token
    _data.read('tokens',id,(err,tokenData) => {
      if(!err && tokenData){
        // Check that the token is still valid
        if(tokenData.expires > Date.now()){
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the update
          _data.update('tokens',id,tokenData,() => {
            if(!err){
                callback(200);
            }else{
              callback(400,{'Error':'Could not store the tokens expiraiton'});
            }
          });
        }else{
          callback(400,{'Error':'The token has already expired'});
        }
      }else{
        callback(400,{'Error':'The specified token does not exist'} );
      }
    });
  }else{
    callback(400, {'Error':'Missing required fields or filds are invalid'});
  }
};

// Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = (data,callback) => {
  // Check that the id number is valid
  let id = typeof(data.queryStringObject.id) && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;
  if(id){
    // Get the tokens
    _data.read('tokens',id, (err,data) => {
      if(!err && data){
        _data.delete('tokens',id, (err) => {
          if(!err){
            callback(200);
          }else{
            callback(500,{'Error':'Could not delete the token'});
          }
        });
      }else{
        callback(400,{"Error":"Could not find the specified token"});
      }
    });
  }else{
    callback(400,{'Error':'Missing required field'});
  }
};

// Verify that the given token is valid for the users
handlers._tokens.verifyToken = (id,phone,callback) => {
  // Get the token
  _data.read('tokens',id,(err,tokenData) => {
    if(!err && tokenData){
      // Check that the given token is for the user and it is not expired
      if(tokenData.phone == phone && tokenData.expires > Date.now()){
        callback(true);
      }else{
        callback(false);
      }
    }else{
      callback(false);
    }
  });
}

//Checks
handlers.checks = (data,callback) => {
  let acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._checks[data.method](data,callback);
  }else{
    callback(405);
  }
};

//Container for checks method
handlers._checks = {};

//Checks - POST
// Required data: protocol, url, method, successCode, timeOutseconds

handlers._checks.post = (data,callback) => {
  //Validate
  let protocol = typeof(data.payload.protocol) == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  let method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if(protcol && url && method && successCodes && timeoutSeconds){
    // Get theh token from the headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user by reading the token
    _data.read('tokens',token,(err,tokenData) => {
      if(!err && tokenData){
        let userPhone = tokenData.phone;
        // Lookup the userdata
        _data.read('users',userPhone,(err,userData) => {
          if(!err && userData){
            let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
            // Verify that the user has less than the max checks per user
            if(userChecks.length < config.maxChecks){
              //Create a random id for the check
              let checkId = helpers.createRandomString(20);

              //Create the check object and include the users phone
              let checkObject = {
                'id' : checkId,
                'userPhone' : userPhone,
                'protocol' : protocol,
                'url' : url,
                'method' : method,
                'successCodes' : successCodes,
                'timeoutSeconds' : timeoutSeconds
              };

            }else{
              callback(400,{'Error':'The user already has the max number och checks ('+config.maxChecks+')'});
            }
          }else{
              callback(403);
          }
        });
      }else{
        callback(403);
      }
    });


  }else{
    callback(400,{'Error':'Missing required inputs or the are invalid'});
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
