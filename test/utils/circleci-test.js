var assert = require('assert');

var circleci = require('../../src/utils/circleci');

describe('utils/circleci', function() {
  var env;

  beforeEach(function() {
    env = process.env;
    process.env = {};
  });

  afterEach(function() {
    process.env = env;
  });

  describe('.getGitHubOptions()', function() {
    it('loads the options from env', function(done) {
      process.env['CIRCLE_PROJECT_USERNAME'] = 'myorg';
      process.env['CIRCLE_PROJECT_REPONAME'] = 'myrepo';
      process.env['CIRCLE_BRANCH']           = 'mybranch';
      process.env['GITHUB_USER']             = 'me';
      process.env['GITHUB_PASS']             = 'mypassword';

      var options = circleci.getGitHubOptions();
      assert.deepEqual(options, {owner: 'myorg', repo: 'myrepo', branch: 'mybranch', auth: {user: 'me', pass: 'mypassword'}});
      done();
    });

    it('with missing env', function(done) {
      assert.throws(circleci.getGitHubOptions);
      done();
    });
  });

  describe('.getDeployerOptions()', function() {
    it('modulus', function(done) {
      process.env['CIRCLE_BRANCH']    = 'mybranch';
      process.env['MODULUS_USERNAME'] = 'me';
      process.env['MODULUS_PASSWORD'] = 'mypassword';

      var options = circleci.getDeployerOptions({service: 'modulus'});
      assert.deepEqual(options, {service: 'modulus', project: 'mybranch', auth: {username: 'me', password: 'mypassword'}});
      done();
    });

    it('modulus with master branch', function(done) {
      process.env['CIRCLE_BRANCH']    = 'master';
      process.env['MODULUS_USERNAME'] = 'me';
      process.env['MODULUS_PASSWORD'] = 'mypassword';

      var options = circleci.getDeployerOptions({service: 'modulus'});
      assert.deepEqual(options, {service: 'modulus', project: null, auth: {username: 'me', password: 'mypassword'}});
      done();
    });

    it('s3-static-website', function(done) {
      process.env['CIRCLE_PROJECT_USERNAME'] = 'My Org';
      process.env['CIRCLE_PROJECT_REPONAME'] = '-- jfd. kjifds. mi92n%$$#@$';
      process.env['CIRCLE_BRANCH']           = '   -- - jifjd fd-0-';
      process.env['AWS_ACCESS_KEY_ID']       = '12345';
      process.env['AWS_SECRET_ACCESS_KEY']   = '54321';

      var options = circleci.getDeployerOptions({service: 's3-static-website'});
      assert.deepEqual(options, {service: 's3-static-website', bucket_name: 'my-org-jfd-kjifds-mi92n-jifjd-fd-0', s3_options: {accessKeyId: '12345', secretAccessKey: '54321'}});
      done();
    });

    it('s3-static-website with master branch', function(done) {
      process.env['CIRCLE_PROJECT_USERNAME'] = 'My Org';
      process.env['CIRCLE_PROJECT_REPONAME'] = '-- jfd. kjifds. mi92n%$$#@$';
      process.env['CIRCLE_BRANCH']           = 'master';
      process.env['AWS_ACCESS_KEY_ID']       = '12345';
      process.env['AWS_SECRET_ACCESS_KEY']   = '54321';

      var options = circleci.getDeployerOptions({service: 's3-static-website'});
      assert.deepEqual(options, {service: 's3-static-website', bucket_name: null, s3_options: {accessKeyId: '12345', secretAccessKey: '54321'}});
      done();
    });

    it('with missing env', function(done) {
      assert.throws(function() {
        circleci.getDeployerOptions({service: 'modulus'});
      });
      done();
    });

    it('with bad service', function(done) {
      var options = circleci.getDeployerOptions({service: 'unknown'});
      assert.deepEqual(options, {service: 'unknown'});
      done();
    });
  });

  describe('.getNotifierOptions()', function() {
    it('github-pull-request', function(done) {
      process.env['CIRCLE_PROJECT_USERNAME'] = 'myorg';
      process.env['CIRCLE_PROJECT_REPONAME'] = 'myrepo';
      process.env['CIRCLE_BRANCH']           = 'mybranch';
      process.env['GITHUB_USER']             = 'me';
      process.env['GITHUB_PASS']             = 'mypassword';

      var options = circleci.getNotifierOptions({service: 'github-pull-request'}, {number: '12345'});
      assert.deepEqual(options, {service: 'github-pull-request', owner: 'myorg', repo: 'myrepo', branch: 'mybranch', auth: {user: 'me', pass: 'mypassword'}, pull_request: '12345', comment: options.comment});
      assert.equal(options.comment('http://review'), '**Ready for review at http://review**\n\n-------------\nAutomatically deployed by CircleCI using [qa-deployer](https://github.com/SparkartGroupInc/qa-deployer)');
      done();
    });

    it('webhook', function(done) {
      process.env['CIRCLE_PROJECT_USERNAME'] = 'myorg';
      process.env['CIRCLE_PROJECT_REPONAME'] = 'myrepo';
      process.env['CIRCLE_BRANCH']           = 'mybranch';
      process.env['GITHUB_USER']             = 'me';
      process.env['GITHUB_PASS']             = 'mypassword';
      process.env['CIRCLE_COMPARE_URL']      = 'http://compare';
      process.env['CIRCLE_USERNAME']         = 'notme';

      var options = circleci.getNotifierOptions({service: 'webhook'}, {html_url: 'http://url', title: 'thetitle'});
      assert.deepEqual(options, {service: 'webhook', body: options.body});
      assert.deepEqual(options.body('http://review'), {github_owner: 'myorg', github_repo: 'myrepo', github_branch: 'mybranch', github_push: {compare_url: 'http://compare', username: 'notme'}, github_pull_request: {url: 'http://url', title: 'thetitle'}, review_url: 'http://review'});
      done();
    });

    it('webhook without a pull request', function(done) {
      process.env['CIRCLE_PROJECT_USERNAME'] = 'myorg';
      process.env['CIRCLE_PROJECT_REPONAME'] = 'myrepo';
      process.env['CIRCLE_BRANCH']           = 'mybranch';
      process.env['GITHUB_USER']             = 'me';
      process.env['GITHUB_PASS']             = 'mypassword';
      process.env['CIRCLE_COMPARE_URL']      = 'http://compare';
      process.env['CIRCLE_USERNAME']         = 'notme';

      var options = circleci.getNotifierOptions({service: 'webhook'});
      assert.deepEqual(options, {service: 'webhook', body: options.body});
      assert.deepEqual(options.body('http://review'), {github_owner: 'myorg', github_repo: 'myrepo', github_branch: 'mybranch', github_push: {compare_url: 'http://compare', username: 'notme'}, review_url: 'http://review'});
      done();
    });

    it('with missing env', function(done) {
      assert.throws(function() {
        circleci.getNotifierOptions({service: 'github-pull-request'}, {number: '12345'});
      });
      done();
    });

    it('with bad service', function(done) {
      var options = circleci.getNotifierOptions({service: 'unknown'});
      assert.deepEqual(options, {service: 'unknown'});
      done();
    });
  });
});
