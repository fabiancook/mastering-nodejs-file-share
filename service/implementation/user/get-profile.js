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
const Q = require('q'),
      Request = require('request-promise'),
      JWT = require('jsonwebtoken'),
      Create = require('./create');

exports = module.exports = function(token) {
  const options = exports.getRequestOptions(token);
  return Q.fcall(Request, options)
    .then(Create);
};

exports.getRequestOptions = function(token) {
  const decoded = JWT.decode(token);
  var issuer = decoded.iss;
  if(issuer.charAt(issuer.length - 1)) {
    issuer = issuer.substr(0, issuer.length - 1);
  }
  return {
    method: 'GET',
    url: issuer + '/tokeninfo',
    qs: {
      id_token: token
    },
    json: true
  };
};