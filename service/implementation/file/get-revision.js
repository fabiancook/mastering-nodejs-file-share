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
const Data = require('../../data'),
      S3   = require('./s3'),
      Q    = require('q');

exports = module.exports = function(_id, key) {

  return Data.Files.findOne(
    {
      _id: Data.getId(_id),
      'revisions.key': key
    },
    {
      _id: 1,
      name: 1
    }
  )
    .then(function(document) {
      return exports.downloadFile(document.name, key);
    });
};

exports.downloadFile = function(name, key) {
  const client = S3.getS3Client();
  const deferred = Q.defer();
  client.getObject({
    Key: key
  }, deferred.makeNodeResolver());
  return deferred.promise
    .then(function(result) {
      return {
        body: result.Body,
        metadata: {
          filename: name,
          contentType: result.ContentType,
          contentLength: result.ContentLength,
          lastModified: result.LastModified,
          eTag: result.ETag,
          encoding: result.ContentEncoding
        }
      };
    });
};

