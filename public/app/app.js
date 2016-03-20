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
  const module = angular.module('ngFileShare', [
    'ui.router',
    'ui.bootstrap',
    'auth0',
    'angular-storage',
    'angular-jwt',
    'btford.socket-io',

    'ngFileShare.home',
    'ngFileShare.login',
    'ngFileShare.sockets',
    'ngFileShare.file'
  ]);

  module.constant('Config', {
    authentication: {
      domain: 'fabiancookdev.au.auth0.com',
      clientID: 'UOwt9BkyMdh4eCGPzwTGWlzIpm7wKUNj',
      callbackUrl: location.href,
      loginState: 'login'
    }
  });

  module.config(function($stateProvider, $urlRouterProvider, Config, authProvider, $httpProvider, jwtInterceptorProvider){
    $urlRouterProvider.otherwise('/');
    authProvider.init(Config.authentication);

    jwtInterceptorProvider.tokenGetter = ['store', function(store){
      return store.get('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor')
  });

  module.run(function(auth) {
    auth.hookEvents();
  });

  module.controller('AppCtrl', ['$scope', 'auth', 'store', '$location', 'socketFactory', '$window', 'Socket', function ($scope, auth, store, $location, socketFactory, $window, Socket) {
    $scope.$on('$stateChangeSuccess', function(event, toState){
      var pageTitle = 'File Share';
      if(toState.data && toState.data.pageTitle) {
        pageTitle = toState.data.pageTitle + ' | ' + pageTitle;
      }
      $scope.pageTitle = pageTitle;
    });

    $scope.$on('$stateNotFound', function(event, unFoundState){
      console.log('Couldn\'t find state ' + unFoundState.to);
      console.log('TO:     ', unFoundState.to);
      console.log('PARAMS: ', unFoundState.params);
      console.log('OPTIONS:', unFoundState.options);
    });

    $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
      console.log('Error thrown while transitioning to state');
      console.log('ERROR: ', error);
      console.log('STATE: ', toState);
      console.log('PARAMS:', toParams);
    });

    $scope.logout = function() {
      console.log('logged out');
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $location.path('/login');
    };

    $scope.auth = auth;

    const socket = Socket.create('/comment');
    socket.emit('message', 'Hello from the client');
    socket.on('message', function(comment) {
      console.log(arguments);
    });


  }])

}(angular));
