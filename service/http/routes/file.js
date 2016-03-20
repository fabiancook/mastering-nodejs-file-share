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
const Impl = require('../../implementation/file'),
      FS   = require('fs');

exports = module.exports = function(server) {

  server.post('/file',              exports.create);
  //server.post('/file/:id/revision', exports.update);
  server.get('/file', exports.list);
  server.get('/file/:id', exports.get);
  server.get('/file/:id/revision/:key', exports.getFile);
};

exports.create = function(request, response, next) {
  const details = exports.getBodyAndMetadataForFile(request);
  return Impl.create(details.metadata, details.body, request.user)
    .then(function(document) {
      const location = '/file/' + document._id;
      response.setHeader('Location', location);
      response.json(201, {
        _id: document._id,
        uri: location
      });
    })
    .catch(next);
};

exports.list = function(request, response, next) {
  Impl.list()
    .then(function(results){
      response.json(200, results);
    })
    .catch(next);
};

//exports.update = function(request, response) {
//
//};

exports.get = function(request, response, next) {

};

exports.getFile = function(request, response, next) {
  Impl.getRevision(request.params.id, request.params.key)
    .then(function(revision) {
      var length = revision.body.length;
      if(!Buffer.isBuffer(revision.body)) {
        length = Buffer.byteLength(revision.body);
      }
      response.setHeader('Content-Type', revision.metadata.contentType);
      response.setHeader('Content-Disposition', 'attachment; filename=' + revision.metadata.filename);
      response.setHeader('Content-Description', 'File Transfer');
      response.setHeader('Content-Length', length);
      response.setHeader('ETag', revision.metadata.eTag);
      response.send(200, revision.body);
    })
    .catch(next);
};

exports.getBodyAndMetadataForFile = function(request) {
  const file = request.files.file;
  const metadata = {
    filename: file.name,
    contentLength: file.size,
    contentType: file.type,
    lastModifiedDate: file.lastModifiedDate,
    hash: file.hash
  };
  const body = FS.createReadStream(file.path);
  return {
    metadata: metadata,
    body: body
  };
};