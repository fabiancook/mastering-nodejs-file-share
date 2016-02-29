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

const mongodb = require('mongodb'),
      Q       = require('q');

exports.create = function(databaseName = "default"){
  var connectionString;
  if(databaseName instanceof mongodb.Db || databaseName instanceof mongodb.MongoClient){
    // They already seem to have the reference, send it back
    return Q(databaseName);
  }
  connectionString = exports.getConnectionStrng(databaseName);
  return exports.getDatabase(connectionString);
};

exports.getHost = function(){
  const environments = [
    'MONGO_URL',
    'MONGOHQ_URL',
    'MONGOLAB_URI'
  ];
  var i;
  for(i = 0; i < environments.length; i += 1){
    if(!process.env[environments[i]]){
      continue;
    }
    return process.env[environments[i]];
  }
  return 'localhost';
};

exports.getConnectionStrng = function(databaseName){
  const host = exports.getHost();
  if(host.indexOf('mongodb:') === 0){
    // If it is already a connection string, the database would have already been defined
    return host;
  }
  return 'mongodb://' + host + '/' + databaseName;
};

if(!global._mongodb_databases){
  global._mongodb_databases = {};
}
exports._databases = global._mongodb_databases;

exports.getDatabase = function(connectionString) {
  var promise, options;
  if(exports._databases[connectionString]){
    return Q(exports._databases[connectionString]);
  }
  options = {
    promiseLibrary: Q.Promise
  };
  promise = mongodb.MongoClient.connect(connectionString, options)
    .then(function(database){

      function closeHandler(){
        database.removeListener('close', closeHandler);
        if(exports._databases[connectionString] !== database){
          return;
        }
        exports._databases[connectionString] = null;
      }

      // Wait for the close, if this happens then the next time we get the database
      // we want a new connection
      database.on('close', closeHandler);

      return exports._databases[connectionString] = database;
    });
  // By setting this to the resulting promise,
  // we can ensure the database is only loaded once
  // as Q will wait for this promise to resolve,
  // we will change this reference once we have
  // the database
  return exports._databases[connectionString] = promise;
};

exports.getCollection = function(database, collectionName){
  if(collectionName instanceof mongodb.Collection){
    return collectionName;
  }
  return database.collection(collectionName);
};

exports.save = function(database, collection, document, options = null, callback = null) {
  collection = exports.getCollection(database, collection);

  return collection.save(document, options, callback)
    .then(function(){
      // Ensure the document is returned
      return document
    });
};

exports.update = function(database, collection, query, updates, options = null, callback = null) {
  collection = exports.getCollection(database, collection);

  return collection.update(query, updates, options, callback);
};


exports.insert = function(database, collection, document, options = null, callback = null) {
  collection = exports.getCollection(database, collection);

  return collection.insert(document, options, callback)
    .then(function(){
      // Ensure the document is returned
      return document
    });
};

exports.findById = function(database, collection, id){
  try{
    id = exports.getId(id);
  }catch(error){
    return Q.reject(error);
  }
  return exports.findOne(database, collection, { _id: id });
};

exports.findOne = function(database, collection, query, projection = null, options = null) {
  const id = exports.tryGetId(query);
  if(id){
    query = { _id: id };
  }
  return exports.find(database, collection, query, projection, options)
    .limit(1)
    .toArray()
    .then(function(results){
      if(results.length){
        return results[0];
      }
      throw new Error('Not Found');
    });
};

exports.find = function(database, collection, query = { }, projection = null, options = null) {
  collection = exports.getCollection(database, collection);
  return collection.find(query, projection, options);
};

exports.findArray = function(database, collection, query = { }, projection = null, options = null){
  return exports.find(database, collection, query, projection, options)
    .toArray();
};

exports.remove = function(database, collection, query = { }, justOne = false){
  const args = arguments.slice();
  justOne = args[args.length-1] === true;
  if(justOne){
    return exports.removeOne(database, collection, query);
  }
  collection = exports.getCollection(database, collection);
  return collection.remove(query);
};

exports.removeOne = function(database, collection, query = { }){
  const id = exports.tryGetId(query);
  if(id){
    return exports.remove(database, collection, { _id: id })
  }
  return exports.findOne(database, collection, query)
    .then(function(document){
      return exports.remove(database, collection, { _id: document._id });
    });
};

exports.count = function(database, collection, query = { }, projection = null, options = null){
  return exports.find(database, collection, query, projection, options)
    .count( );
};

exports.tryGetId = function(id){
  try{
    return exports.getId(id);
  }catch(error){
    return null;
  }
};

exports.getId = function(id){
  if(id == null){
    throw new Error('Id invalid');
  }
  if(id instanceof mongodb.ObjectId){
    return id;
  }
  if(!(typeof id === 'string')){
    id = id.toString();
  }
  return new mongodb.ObjectId(id);
};