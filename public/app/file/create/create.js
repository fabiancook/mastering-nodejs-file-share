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
  const module = angular.module('ngFileShare.file.create', [
    'ui.router',
    'auth0',
    'ngFileUpload'
  ]);

  module.config(function($stateProvider){
    $stateProvider.state('file_create', {
      url: '/file/create',
      views: {
        main: {
          controller: 'FileCreateCtrl',
          templateUrl: 'app/file/create/create.tpl.html'
        }
      },
      data: {
        requiresLogin: true
      }
    });
  });

  module.controller('FileCreateCtrl', ['$scope', 'auth', 'Upload', '$location', function($scope, auth, Upload, $location){
    $scope.profile = auth.profile;


    $scope.submit = function(){
      if ($scope.form.file.$valid && $scope.file) {
        $scope.upload($scope.file);
      }
    };

    $scope.upload = function (file) {
      Upload.upload({
        url: '/file',
        data: {file: file, 'username': $scope.username}
      }).then(function () {
        $location.path('/file');
      }, function (response) {
        alert('Failed to upload file' + response.status);
      });
    };

  }]);
}(angular));
