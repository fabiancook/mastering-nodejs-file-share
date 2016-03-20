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

const data = require('./data');

class Collection {

  static create(databaseName, collectionName) {
    return data.create( databaseName )
      .then(function(database) {
        const collection = data.getCollection(database, collectionName);
        return new Collection(database, collection);
      });
  }

  static tryGetId(id) {
    return data.tryGetId(id);
  }

  static getId(id) {
    return data.getId(id);
  }

  constructor(database, collection) {
    this.database = database;
    this.collection = collection;
  }

  save(document, options = null) {
    return data.save(this.database, this.collection, document, options);
  }

  update(query, update, options = null) {
    return data.update(this.database, this.collection, query, update, options);
  }

  insert(document, options = null) {
    return data.insert(this.database, this.collection, document, options);
  }

  findById(id) {
    return data.findById(this.database, this.collection, id);
  }

  findOne(query = { }, projection = null, options = null) {
    return data.findOne(this.database, this.collection, query, projection, options);
  }

  find(query = { }, projection = null, options = null) {
    return data.find(this.database, this.collection, query, projection, options);
  }

  findAndModify(query = {}, sort= null, doc = null, options = null) {
    return data.findAndModify(this.database, this.collection, query, sort, doc, options);
  }

  findArray(query = { }, projection = null, options = null) {
    return data.findArray(this.database, this.collection, query, projection, options);
  }

  remove(query = { }, justOne = false) {
    return data.remove(this.database, this.collection, query, justOne);
  }

  removeOne(query = { }) {
    return data.removeOne(this.database, this.collection, query);
  }

  count(query = { }, projection = null, options = null) {
    return data.count(this.database, this.collection, query, projection, options);
  }

  tryGetId(id) {
    return data.tryGetId(id);
  }

  getId(id) {
    return data.getId(id);
  }
}

exports = module.exports = Collection;