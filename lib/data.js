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
lib.baseDir = path.join(__dirname,'/../.data/');


// Write data to a file
lib.create = (dir,file,data,callback) => {

  fs.open(lib.baseDir+dir+'/'+file+'.json','wx', (err,fileDescriptor) => {

    if(!err && fileDescriptor){
      // Convert data to a string
      let stringData = JSON.stringify(data);

      // Write to file and close
      fs.writeFile(fileDescriptor,stringData, (err) => {
        if(!err){
          fs.close(fileDescriptor, (err) => {
            if(!err){
              callback(false);
            }else{
              callback('Error closing new file')
            }
          });
        }else{
          callback('Error writing to new file')
        }
      });

    }else{
      callback('Could not create a new file. It may already exist');
    }
  });
};

// Read data from a file
lib.read = (dir,file,callback) => {
  fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8', (err,data) => {
    callback(err,data);
  });
};

// Update date in a file
lib.update = () => {

};








// Export the module
module.exports = lib;
