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

(function(angular){
  const module = angular.module('ngFileShare.login', [
    'ui.router',
    'auth0',
    'angular-storage',
    'angular-jwt'
  ]);

  module.config(function($stateProvider){
    $stateProvider.state('login', {
      url: '/login',
      views: {
        main: {
          controller: 'LoginCtrl',
          templateUrl: 'app/login/login.tpl.html'
        }
      },
      data: {
      }
    });
  });

  module.controller('LoginCtrl', ['$scope', 'auth', 'store', '$location', function($scope, auth, store, $location){
    auth.signin({}, function(profile, token){
      store.set('profile', profile);
      store.set('token', token);
      $location.path('/');
    }, function(error){
      // Error
      console.log(arguments);
    });
  }]);
}(angular));
