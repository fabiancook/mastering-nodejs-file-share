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

const bunyan = require('bunyan'),
      config = require('config'),
      pkg    = require('../package.json'),
      spawn  = require('child_process').spawn;

exports = module.exports = create();
exports.create = create;
exports.getStreams = getStreams;
exports.getStdOutStream = getStdOutStream;
exports.getStdOutLevel = getStdOutLevel;
exports.getConfig = getConfig;

function create(){
  const config = getConfig();
  return new bunyan(config);
}

function getStreams(){
  const streams = [];

  if(config.has('logging.stdout_enabled') && config.get('logging.stdout_enabled')){
    streams.push(getStdOutStream());
  }

  return streams;
}

function getStdOutStream(){
  const level = getStdOutLevel();
  return {
    stream: process.stdout,
    level: level
  };
}

function getStdOutLevel(){
  return config.has('logging.stdout_level') ? config.get('logging.stdout_level') : 'info';
}

function getConfig(){
  const streams = getStreams();
  return {
    name: pkg.name,
    streams: streams,
    serializers: bunyan.stdSerializers
  };
}