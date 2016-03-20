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
const Config = require('config'),
      AWS    = require('aws-sdk');

exports.getConfig = function(){
  if(!Config.has('aws.s3.accessKeyId') || !Config.has('aws.s3.secretAccessKey')) {
    throw new Error("AWS S3 not configured");
  }
  if(!Config.has('aws.s3.params') || !Config.has('aws.s3.params.Bucket')) {
    throw new Error("AWS S3 Bucket not configured");
  }
  return {
    params: Config.get('aws.s3.params'),
    accessKeyId: Config.get('aws.s3.accessKeyId'),
    secretAccessKey: Config.get('aws.s3.secretAccessKey'),
    region: Config.get('aws.s3.region')
  };
};

exports.getS3Client = function() {
  const config = exports.getConfig();
  return new AWS.S3(config);
};
