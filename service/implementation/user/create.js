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
      Get = require('./get');

exports = module.exports = function(user) {
  return Get(user.user_id, {_id: 1})
    .then(function(result){
      return Data.Users.update({_id: result._id}, { $set: user });
    })
    .catch(function(error) {
      if(error.message !== 'Not Found'){
        throw error;
      }
      return Data.Users.insert(user);
    });
};