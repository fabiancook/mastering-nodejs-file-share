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

exports = module.exports = function(io) {
  io.of('/comment').on('connection', exports.listener);
};

exports.listener = function(socket) {
  socket.on('message', function(){
    console.log(arguments);
  });
  socket.emit('message', 'Hello from the server', socket.user);
};