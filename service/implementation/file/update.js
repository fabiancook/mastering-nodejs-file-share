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
      S3        = require('aws-sdk').S3,
      Config    = require('config'),
      Q         = require('q'),
      MongoDb   = require('mongodb'),
      Stringify = require( 'json-stringify-safe' );

exports = module.exports = function(_id, metadata, stream, user) {
  return Data.findById(_id)
    .then(function(document) {
      return exports.updateDocument(document, metadata, stream, user);
    });
};

exports.updateDocument = function(document, metadata, stream, user) {
  const revision = {
    key: new MongoDb.ObjectId().toString(),
    create_date: new Date(),
    update_date: new Date(),
    user: {
      _id: user._id
    }
  };
  document.revisions_in_progress.push(revision);
  return Data.update(
    {
      _id: document._id
    },
    {
      $push: {
        revisions_in_progress: revision
      },
      $currentDate: {
        update_date: true
      }
    }
  )
    .then(function(){
      return exports.uploadFile(key, stream)
    });
};

exports.uploadFile = function(document, key, stream) {
  const client = exports.getS3Client();
  const params = {
    Key: key,
    Body: stream
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
  currentRevision.error = Stringify(error || false);
  currentRevision.result = Stringify(result || false);
  document.revisions.push(currentRevision);
  return Data.update(
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
      return Data.findAndModify(
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
};

exports.getConfig = function(){
  if(!Config.has('aws.s3.accessKeyId') || !Config.has('aws.s3.secretAccessKey')) {
    throw new Error("AWS S3 not configured");
  }
  const config = {
    params: { },
    accessKeyId: Config.get('aws.s3.accessKeyId'),
    secretAccessKey: Config.get('aws.s3.secretAccessKey'),
    region: Config.has('aws.s3.region')
  };

  if(Config.has('aws.s3.params')) {
    config.params = Config.get('aws.s3.params');
  }

  return config;
};

exports.getS3Client = function() {
  const config = exports.getConfig();
  return new S3(config);
};
