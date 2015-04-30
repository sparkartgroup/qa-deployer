var assert = require('assert');
var sinon = require('sinon');

var Bucket = require('s3-site/lib/bucket').Bucket;
var AWS = require('aws-sdk');
var s3_static_website = require('../../src/deployers/s3-static-website');
var utils = require('../../src/utils/utils.js');

describe('deployers/s3-static-website', function() {
  var options;
  var mock_bucket;

  beforeEach(function() {
    options = {
      s3_options: {accessKeyId: '12345', secretAccessKey: '54321'},
      bucket_name: 'the-bucket-name'
    };
    this.sinon = sinon.sandbox.create();
    mock_bucket = this.sinon.mock(Bucket.prototype);
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('.init()', function() {
    it('initializes options.bucket_name', function(done) {
      var mock_utils = this.sinon.mock(utils);
      mock_utils.expects('cwdName').returns('some-project');

      assert.equal(s3_static_website.init({}).options.bucket_name, 'some-project');
      done();
    });

    it('initializes options.region', function(done) {
      assert.equal(s3_static_website.init({}).options.region, 'us-east-1');
      done();
    });
  });

  describe('.deploy()', function() {
    it('deploys to a new website', function(done) {
      mock_bucket.expects('verifyExistence').yields('Does not exist');
      mock_bucket.expects('deploy').yields();

      var s3 = s3_static_website.init(options);
      s3.deploy(function(redeploy, review_url) {
        assert(!redeploy);
        assert.equal(review_url, 'http://the-bucket-name.s3-website-us-east-1.amazonaws.com');
        done();
      });
    });

    it('deploys to an existing website', function(done) {
      mock_bucket.expects('verifyExistence').yields();
      mock_bucket.expects('deploy').yields();

      var s3 = s3_static_website.init(options);
      s3.deploy(function(redeploy, review_url) {
        assert(redeploy);
        assert.equal(review_url, 'http://the-bucket-name.s3-website-us-east-1.amazonaws.com');
        done();
      });
    });
  });

  describe('.withdraw()', function() {
    it('destroys a website', function(done) {
      mock_bucket.expects('destroy').yields();

      var s3 = s3_static_website.init(options);
      s3.withdraw(function() {
        done();
      });
    });

    describe('with multiple buckets', function() {
      beforeEach(function() {
        options.bucket_names = ['the-bucket-name1', 'the-bucket-name2', 'the-bucket-name3'];
      });

      it('destroys matching websites', function(done) {
        var mock_AWS = this.sinon.mock(AWS);
        mock_AWS.expects('S3').returns({
          listBuckets: function(callback) {
            callback(null, {Buckets: [{Name: 'the-bucket-name1'}, {Name: 'the-bucket-name2'}]})
          },
          getBucketLocation: function(options, callback) {
            if (options.Bucket === 'the-bucket-name1') return callback(null, {LocationConstraint: 'us-west-1'});
            if (options.Bucket === 'the-bucket-name2') return callback(null, {});
            assert(false);
          }
        });
        mock_AWS.expects('S3').twice(); // Used by s3-site

        mock_bucket.expects('destroy').yields();
        mock_bucket.expects('destroy').yields();

        var s3 = s3_static_website.init(options);
        s3.withdraw(function() {
          done();
        });
      });
    });
  });
});
