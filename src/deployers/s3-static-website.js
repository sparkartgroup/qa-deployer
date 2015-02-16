var async  = require('async');
var Bucket = require('s3-site/lib/bucket').Bucket;
var utils  = require('../utils/utils.js');

exports.init = function(options) {
  options.bucket_name || (options.bucket_name = utils.cwdName());
  options.region      || (options.region = 'us-east-1');

  var bucket = new Bucket(
    {
      name:             options.bucket_name,
      region:           options.region,
      srcPath:          process.cwd(),
      removeExtensions: options.removeExtensions,
      indexDocument:    options.indexDocument
    },
    options.s3_options
  );

  var deploy = function(callback) {
    console.log('Deploying to S3 bucket: ' + options.bucket_name + ' (' + options.region + ')');
    bucket.verifyExistence(function(err) {
      if (err && err !== 'Does not exist') throw err;
      var redeploy = !err;

      bucket.deploy(function(err) {
        if (err) throw err;
        var review_url = 'http://' + options.bucket_name + '.s3-website-' + options.region + '.amazonaws.com';

        callback(redeploy, review_url);
      });
    });
  };

  var withdraw = function(callback) {
    console.log('Deleting S3 bucket: ' + options.bucket_name + ' (' + options.region + ')');
    bucket.destroy(function(err) {
      if (err) throw err;
      callback();
    });
  };

  return {deploy: deploy, withdraw: withdraw, options: options, bucket: bucket};
};
