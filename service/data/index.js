/*
 Copyright 2016 Packt Publishing

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const Data       = require('./data'),
      Collection = require('./collection'),
      Q          = require('q');

exports = module.exports = Data;
exports.Collection = Collection;

exports.initialize = function(){
  const keys = Object.keys(exports);
  var promises;
  promises = keys
    .filter(function(key){
      return exports[key] instanceof Collection;
    })
    .map(function(key){
      const originalCollection = exports[key];
      // Use the details originally provided
      return Collection.create(originalCollection.database, originalCollection.collection)
        .then(function(collection){
          // Now we have a real collection
          exports[key] = collection;
        });
    });

  return Q.all(promises);
};

exports.databaseName = "file_share";

// Will use these as holders and code completion
// We are going to prepend the collection names with the database name so we don't
// get any conflicts with other projects
exports.Users = new Collection(exports.databaseName, exports.databaseName + "_users");
exports.Comments = new Collection(exports.databaseName, exports.databaseName + "_comments");
exports.Files = new Collection(exports.databaseName, exports.databaseName + "_files");