/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs =  require('fs');
const path = require('path');

// Container for the library (for export)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data');


// Write data to a file
lib.create = (dir,file,data,callback) => {
  fs.open(lib.baseDir+dir+'/'+file+'.json','wx', (err,fileDescriptor) => {
    if(!err && fileDescriptor){

    }else{
      callback('Could not create a new file. It may already exist');
    }


  });

};








// Export the module
module.exports = lib;
