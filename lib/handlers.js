// Define handlers
let handlers = {};

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
