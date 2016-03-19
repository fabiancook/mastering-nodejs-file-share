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

(function(angular) {
  const module = angular.module('ngFileShare.sockets', [
    'btford.socket-io'
  ]);

  module.factory('Socket', ['socketFactory', 'auth', 'store', '$window', function(socketFactory, auth, store, $window) {

    const self = {};

    self.getPathFromString = function(path) {
      if(!path || typeof path !== 'string' || path.length === 0) {
        return '/';
      }
      if(path.charAt(0) !== '/') {
        path = '/' + path;
      }
      return path;
    };

    self.sockets = {};

    self.createInternal = function(path, token) {
      var port, hostname, protocol, options = {}, url, ioSocket;
      path = self.getPathFromString(path);

      port = $window.location.port;
      hostname = $window.location.hostname;
      protocol = $window.location.protocol;

      if(protocol.indexOf('s') > -1) {
        protocol = 'wss:';
      } else {
        protocol = 'ws:';
      }

      url = protocol + '//' + hostname + ':' + port + path;

      options.query = 'token=' + token;

      ioSocket = io(url, options);

      const socket = socketFactory({
        ioSocket: ioSocket
      });

      socket.ioSocket = ioSocket;

      return socket;
    };

    self.create = function(path){
      var socket;

      const emitBuffer = [];
      const callbackListeners = [];

      const listener = {
        register: function(socket) {
          callbackListeners.forEach(function(args) {
            socket.on.apply(socket, args);
          });
          emitBuffer.forEach(function(args) {
            socket.emit.apply(socket, args);
          });
          emitBuffer.splice(0, emitBuffer.length);
        },
        on: function(event, callback) {
          const args = Array.prototype.slice.call(arguments);
          callbackListeners.push(args);
          if(!socket) return;
          socket.on.apply(socket, args);
        },
        emit: function(event, args) {
          if(socket) return socket.emit(event, args);
          emitBuffer.push(Array.prototype.slice.call(arguments))
        }
      };

      function create(){
        if(socket) {
          return;
        }
        if(!auth.isAuthenticated) {
          return;
        }
        socket = self.createInternal(path, auth.idToken);
        listener.register(socket);
      }

      function disconnect(){
        socket.disconnect();
        socket = null;
      }

      auth.config.on('authenticated', create);
      auth.config.on('loginSuccess', create);

      auth.config.on('loginFailure', disconnect);
      auth.config.on('logout', disconnect);

      create();

      return listener
    };

    return self;
  }]);

}(angular));