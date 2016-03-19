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

const SocketIO = require('socket.io'),
      SocketIOJWT = require('socketio-jwt'),
      config = require('config'),
      User = require('../implementation/user'),
      Namespaces = require('./namespaces');

exports.start = function(restifyServer) {
  const io = SocketIO.listen(restifyServer.server, { });
  exports.setAuthentication(io);
  exports.listen(io);
};

exports.setAuthenticationForNamespace = function(namespace) {
  const authenticationConfig = exports.getAuthenticationConfig();
  const authenticator = SocketIOJWT.authorize(authenticationConfig);
  namespace.use(function(socket, next) {
    authenticator(socket.request, function(err, authorized) {
      if (err) return next(new Error(err));
      if (!authorized) return next(new Error('Not authorized'));
      next();
    });
  });
  namespace.use(function(socket, next) {
    User.getProfile(socket.handshake.query.token)
      .then(function(user) {
        socket.user = user;
      })
      .then(next.bind(null, null, null, null))
      .catch(next);
  });
};

exports.setAuthentication = function(io) {
  exports.setAuthenticationForNamespace(io);

  io._of = io.of;
  io.of = function(name, fn) {
    const namespace = io._of(name);
    exports.setAuthenticationForNamespace(namespace);
    if(fn) {
      namespace.on('connection', fn);
    }
    return namespace;
  };
};

exports.getAuthenticationConfig = function(){
  if(!config.has('httpAuth0.secret.contents') ||
    !config.has('httpAuth0.secret.encoding') ||
    !config.has('httpAuth0.audience')){
    throw new Error("httpAuth0 config expected");
  }
  const secretContents = config.get('httpAuth0.secret.contents'),
        secretEncoding = config.get('httpAuth0.secret.encoding');

  return {
    secret: new Buffer(secretContents, secretEncoding),
    handshake: true
  };
};

exports.listen = function(io) {
  Namespaces(io);
};