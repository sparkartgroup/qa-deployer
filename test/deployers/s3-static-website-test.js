var assert = require('assert');
var sinon = require('sinon');

var s3_static_website = require('../../src/deployers/s3-static-website');

describe('deployers/s3-static-website', function() {
  var options;

  beforeEach(function() {
    options = {
      s3_options: {accessKeyId: '12345', secretAccessKey: '54321'},
      bucket_name: 'the-bucket-name'
    };
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('.deploy()', function() {
    it('deploys to a new website', function(done) {
      var s3 = s3_static_website.init(options);
      var mock_bucket = this.sinon.mock(s3.bucket);

      mock_bucket.expects('verifyExistence').yields('Does not exist');
      mock_bucket.expects('verifyExistence').yields('Does not exist');
      mock_bucket.expects('create').yields();
      mock_bucket.expects('upload').yields();

      s3.deploy(function(redeploy, review_url) {
        assert(!redeploy);
        assert.equal(review_url, 'http://the-bucket-name.s3-website-us-east-1.amazonaws.com');
        done();
      });
    });

    it('deploys to an existing website', function(done) {
      var s3 = s3_static_website.init(options);
      var mock_bucket = this.sinon.mock(s3.bucket);

      mock_bucket.expects('verifyExistence').yields();
      mock_bucket.expects('verifyExistence').yields();
      mock_bucket.expects('listContents').yields();
      mock_bucket.expects('removeContents').yields();
      mock_bucket.expects('removeBucket').yields();
      mock_bucket.expects('create').yields();
      mock_bucket.expects('upload').yields();

      s3.deploy(function(redeploy, review_url) {
        assert(redeploy);
        assert.equal(review_url, 'http://the-bucket-name.s3-website-us-east-1.amazonaws.com');
        done();
      });
    });
  });

  describe('.withdraw()', function() {
    it('destroys an existing website', function(done) {
      var s3 = s3_static_website.init(options);
      var mock_bucket = this.sinon.mock(s3.bucket);

      mock_bucket.expects('verifyExistence').yields();
      mock_bucket.expects('listContents').yields();
      mock_bucket.expects('removeContents').yields();
      mock_bucket.expects('removeBucket').yields();

      s3.withdraw(function() {
        done();
      });
    });

    it('does not destroy a non-existing website', function(done) {
      var s3 = s3_static_website.init(options);
      var mock_bucket = this.sinon.mock(s3.bucket);

      mock_bucket.expects('verifyExistence').yields('Does not exist');

      s3.withdraw(function() {
        done();
      });
    });
  });
});
