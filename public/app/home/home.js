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
  const module = angular.module('ngFileShare.home', [
    'ui.router',
    'auth0'
  ]);

  module.config(function($stateProvider){
    $stateProvider.state('home', {
      url: '/',
      views: {
        main: {
          controller: 'HomeCtrl',
          templateUrl: 'app/home/home.tpl.html'
        }
      },
      data: {
        requiresLogin: true
      }
    });
  });

  module.controller('HomeCtrl', ['$scope', 'auth', function($scope, auth){
    $scope.profile = auth.profile;
  }]);
}(angular));
