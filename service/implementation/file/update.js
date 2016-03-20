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
const Data      = require('../../data'),
      S3        = require('./s3'),
      Q         = require('q'),
      MongoDb   = require('mongodb'),
      Stringify = require( 'json-stringify-safe' );

exports = module.exports = function(_id, metadata, body, user) {
  return Data.Files.findById(_id)
    .then(function(document) {
      return exports.updateDocument(document, metadata, body, user);
    });
};

exports.updateDocument = function(document, metadata, body, user) {
  const revision = {
    key: new MongoDb.ObjectId().toString(),
    create_date: new Date(),
    update_date: new Date(),
    user: {
      _id: user._id
    },
    metadata: metadata
  };
  document.revisions_in_progress.push(revision);
  return Data.Files.update(
    {
      _id: document._id
    },
    {
      $set: {
        contentType: metadata.contentType
      },
      $push: {
        revisions_in_progress: revision
      },
      $currentDate: {
        update_date: true
      }
    }
  )
    .then(function(){
      return exports.uploadFile(document, revision.key, body)
    })
    .then(function(){
      return document;
    });
};

exports.uploadFile = function(document, key, body) {
  const client = S3.getS3Client();
  const params = {
    Key: key,
    Body: body
  };
  const options = {
    partSize: 10 * 1024 * 1024,
    queueSize: 1
  };
  const deferred = Q.defer();
  client.upload(params, options, deferred.makeNodeResolver());
  return deferred.promise
    .then(function(result) {
      return exports.updateDocumentAfterUpload(null, result, document, key);
    })
    .catch(function(error) {
      return exports.updateDocumentAfterUpload(error, null, document, key);
    });
};

exports.getCircularSafe = function(object) {
  const string = Stringify(object);
  return JSON.parse(string);
};

exports.updateDocumentAfterUpload = function(error, result, document, key) {
  const currentRevision = document.revisions_in_progress.find(function(revision) {
    return key === revision.key;
  });
  if(!currentRevision) {
    throw new Error('Could not update revision ' + key + ' for file ' + document._id);
  }
  if(!error){
    currentRevision.upload_date = new Date();
  }
  currentRevision.update_date = new Date();
  currentRevision.error = exports.getCircularSafe(error || false);
  currentRevision.result = exports.getCircularSafe(result || false);
  document.revisions.push(currentRevision);
  return Data.Files.update(
    {
      _id: document._id
    },
    {
      $push: {
        revisions: currentRevision
      },
      $currentDate: {
        update_date: true
      }
    }
  )
    .then(function(){
      return Data.Files.findAndModify(
        {
          _id: document._id,
          revisions_in_progress: {
            $size: 1
          }
        },
        {
          _id: 1
        },
        {
          $set: {
            revisions_in_progress: [ ]
          },
          $currentDate: {
            update_date: true
          }
        }
      )
    })
    .then(function(){
      if(!error) return;
      throw error;
    })
};
