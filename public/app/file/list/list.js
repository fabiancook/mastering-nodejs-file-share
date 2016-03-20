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
  const module = angular.module('ngFileShare.file.list', [
    'ui.router',
    'auth0'
  ]);

  module.config(function($stateProvider){
    $stateProvider.state('file_list', {
      url: '/file',
      views: {
        main: {
          controller: 'FileListCtrl',
          templateUrl: 'app/file/list/list.tpl.html'
        }
      },
      data: {
        requiresLogin: true
      }
    });
  });

  module.controller('FileListCtrl', ['$scope', 'auth', '$http', '$window', 'store', function($scope, auth, $http, $window, store){
    $scope.profile = auth.profile;

    $scope.files = [];

    $scope.refresh = function(){
      $http.get('/file')
        .then(function(response) {
          $scope.files = response.data;
        })
        .catch(function(error){
          console.error(error);
        });
    };

    $scope.downloadMostRecent = function(file) {
      const mostRecent = file.revisions[file.revisions.length - 1];
      const mostRecentKey = mostRecent.key;
      const query = 'access_token=' + store.get('token');
      $window.open('/file/' + file._id + '/revision/' + mostRecentKey + '?' + query, '_blank');
    };

    $scope.refresh();

  }]);
}(angular));
