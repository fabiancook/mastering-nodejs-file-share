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
const Update = require('./update'),
      Data   = require('../../data');

exports = exports.module = function(metadata, stream, user){
  const document = exports.createDocument(metadata, user);

  return Data.Files.insert(document)
    .then(function(document) {
      return Update(document._id, metadata, stream, user);
    });
};

exports.createDocument = function(metadata, user) {
  return {
    metadata: metadata,
    user: {
      _id: user._id
    },
    create_date: new Date( ),
    update_date: new Date( ),
    revisions_in_progress: [ ],
    revisions: [ ]
  };
};