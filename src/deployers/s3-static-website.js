var async  = require('async');
var Bucket = require('s3-site/lib/bucket').Bucket;
var AWS    = require('aws-sdk');
var utils  = require('../utils/utils.js');

exports.init = function(options) {
  options.bucket_name || (options.bucket_name = utils.cwdName());
  options.region      || (options.region = 'us-east-1');

  var s3SiteBucket = function(name, region) {
    return new Bucket(
      {
        name:             name || options.bucket_name,
        region:           region || options.region,
        srcPath:          process.cwd(),
        removeExtensions: options.removeExtensions,
        indexDocument:    options.indexDocument
      },
      options.s3_options
    );
  };

  var deploy = function(callback) {
    console.log('Deploying to S3 bucket: ' + options.bucket_name + ' (' + options.region + ')');

    var bucket = s3SiteBucket();
    bucket.verifyExistence(function(err) {
      if (err && err !== 'Does not exist') throw err;
      var redeploy = !err;

      async.series(
        [
          function(callback) {
            if (redeploy) {
              bucket.listContents(function(err, contents) {
                err ? callback(err) : bucket.removeContents(contents, callback);
              });
            } else {
              bucket.createBucket(callback);
            }
          },
          function(callback) {bucket.makeWebsite(callback)},
          function(callback) {bucket.makePublic(callback)},
          function(callback) {bucket.upload(callback)}
        ],
        function(err) {
          if (err) throw err;
          var review_url = 'http://' + options.bucket_name + '.s3-website-' + options.region + '.amazonaws.com';

          callback(redeploy, review_url);
        }
      );
    });
  };

  var withdraw = function(callback) {
    options.bucket_names ? destroyBuckets(callback) : destroyBucket(callback);
  };

  var destroyBucket = function(callback) {
    console.log('Deleting S3 bucket: ' + options.bucket_name + ' (' + options.region + ')');

    var bucket = s3SiteBucket();
    bucket.destroy(function(err) {
      if (err) throw err;

      callback();
    });
  };

  var destroyBuckets = function(callback) {
    var s3 = new AWS.S3(options.s3_options || {});

    console.log('Retrieving S3 buckets');
    s3.listBuckets(function(err, data) {
      if (err) throw err;

      async.each(data.Buckets, function(bucket, callback) {
        if (options.bucket_names.indexOf(bucket.Name) > -1) {
          console.log('Retrieving S3 bucket region: ' + bucket.Name);
          s3.getBucketLocation({Bucket: bucket.Name}, function(err, data) {
            if (err) throw err;

            var region = data.LocationConstraint || 'us-east-1';
            var s3_site_bucket = s3SiteBucket(bucket.Name, region);

            console.log('Deleting S3 bucket: ' + bucket.Name + ' (' + region + ')');
            s3_site_bucket.destroy(function(err) {
              if (err) throw err;

              callback();
            });
          });
        } else {
          callback();
        }
      }, callback);
    });
  };

  return {deploy: deploy, withdraw: withdraw, options: options};
};
