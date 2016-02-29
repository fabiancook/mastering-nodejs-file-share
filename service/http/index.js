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

const routes = require('./routes'),
      checkToken = require('express-jwt'),
      config = require('config'),
      Q = require('q'),
      restify = require('restify'),
      logger = require('../logging'),
      morgan = require('morgan'),
      pkg = require('../../package.json'),
      path = require('path'),
      glob = require('glob'),
      //staticServer = require('node-static').Server,
      fs = require('fs'),
      Request = require('request-promise'),
      UnauthorizedError = ('express-jwt/lib/errors/UnauthorizedError'),
      User = require('../implementation/user/index');

exports.start = function(){
  return exports.initializeServer();
};

exports.initializeServer = function(){
  const server = exports.createServer();

  exports.addLogging(server);
  exports.initializeBaseMiddleware(server);
  exports.initializePublicStatic(server);
  exports.initializeAuthentication(server);
  exports.initializeRoutes(server);
  exports.listen(server);

  return server;
};

exports.createServer = function(){
  const plainFormatter = exports.getPlainFormatter();
  return restify.createServer({
    name: pkg.name,
    version: pkg.version,
    formatters: {
      '*/*': plainFormatter,
      'text/html': plainFormatter,
      'text/xml': plainFormatter
    }
  })
};

exports.getPlainFormatter = function(){
  return function(request, response, body, callback){
    if(body instanceof Error){
      body = JSON.stringify({
        code: body.code,
        message: body.message
      });
    }
    return callback(null, body);
  };
};

exports.addLogging = function(server){
  if(!config.has('httpServer.logging') || !config.get('httpServer.logging.enabled')){
    return;
  }
  const middleware = exports.getLoggerMiddleware();
  server.use(middleware);
};

exports.getLoggerMiddleware = function(){
  const write = function(message){
    const args = Array.prototype.slice.call(arguments);
    return logger.info.apply(logger, args);
  };
  return morgan(
    config.has('httpServer.logging.format') ? config.get('httpServer.logging.format') : 'common',
    {
      stream: {
        write: write
      }
    }
  );
};

exports.initializeBaseMiddleware = function(server){
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.authorizationParser());
  server.use(restify.dateParser());
  server.use(restify.queryParser());
  server.use(restify.jsonp());
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser());
  server.use(restify.requestExpiry({
    header: 'x-request-expiry-time'
  }));
  server.use(restify.throttle({
    burst: 100,
    rate: 50,
    ip: true,
    overrides: {
      '192.168.1.1': {
        rate: 0,
        burst: 0
      },
      '0.0.0.0': {
        rate: 0,
        burst: 0
      },
      '127.0.0.1': {
        rate: 0,
        burst: 0
      }
    }
  }));
  server.use(restify.conditionalRequest());
};

exports.initializePublicStatic = function(server){
  server.get(/^\/(index\/?)?$/, function(request, response, next){
    response.redirect('/index.html', next);
  });
  server.get(/^\/.*\.(html|png|css|js|json)$/, restify.serveStatic({
    directory: './public'
  }));
};

exports.initializeAuthentication = function(server){
  const config = exports.getAuthenticationConfig(server);
  server.use(checkToken(config));
  server.use(exports.getUserProfile);
};

exports.getAuthenticationToken = function(request) {
  if(request.headers && request.headers.authorization) {
    var parts = request.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      } else {
        throw new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' });
      }
    } else {
      throw new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' });
    }
  } else if(request.query && request.query.access_token) {
    return request.query.access_token;
  }
};

exports.getUserProfile = function(request, response, next) {
  var token;
  try{
    token = exports.getAuthenticationToken(request);
  } catch(e) {
    return next(e);
  }
  const options = {
    method: 'GET',
    url: request.user.iss + 'tokeninfo',
    qs: {
      id_token: token
    },
    json: true
  };
  Request(options)
    .then(function(user){
      request.user = user;
      return User.create(user);
    })
    .then(next.bind(null, null, null, null))
    .catch(next);
};

exports.getAuthenticationConfig = function(){
  if(!config.has('httpAuth0.secret.contents') ||
    !config.has('httpAuth0.secret.encoding') ||
    !config.has('httpAuth0.audience')){
    throw new Error("httpAuth0 config expected");
  }
  const secretContents = config.get('httpAuth0.secret.contents'),
    secretEncoding = config.get('httpAuth0.secret.encoding'),
    audience = config.get('httpAuth0.audience');

  return {
    secret: new Buffer(secretContents, secretEncoding),
    audience: audience,
    getToken: exports.getAuthenticationToken
  };
};

exports.initializeRoutes = function(server){
  routes(server);
};

exports.getPort = function(){
  const def = 8080;
  var port = config.has('httpServer.port') ? config.get('httpServer.port') : def;
  if(process.env['PORT']) {
    port = process.env['PORT'];
  }
  if(typeof port === 'string'){
    port = +port;
  }
  if(isNaN(port)){
    port = def;
  }
  return port;
};

exports.listen = function(server){
  const port = exports.getPort();
  server.listen(port, exports.listening.bind(exports, port));
};

exports.listening = function(port) {
  logger.info("Listening for HTTP requests on port " + port);
};