var assert = require('assert');
var sinon  = require('sinon');

var circleci    = require('../../src/utils/circleci');
var cli         = require('../../src/utils/cli');
var github_api  = require('../../src/utils/github-api');
var qa_deployer = require('../../qa-deployer');

describe('utils/cli', function() {
  var argv;
  var env;

  beforeEach(function() {
    argv = process.argv;
    env  = process.env;
    process.argv = [];
    process.env  = {};
    this.sinon = sinon.sandbox.create();
    delete require.cache[require.resolve('./cli-test-options')];
  });

  afterEach(function() {
    process.argv = argv;
    process.env  = env;
    this.sinon.restore();
  });

  describe('.getCLIOptions()', function() {
    it('with no CLI options', function(done) {
      process.argv = ['node', 'script'];

      var options = cli.getCLIOptions();
      assert.deepEqual(options, {deployer: {service: undefined}, notifiers: []});
      done();
    });

    it('with deployer', function(done) {
      process.argv = ['node', 'script', '--deployer=modulus'];

      var options = cli.getCLIOptions();
      assert.deepEqual(options, {deployer: {service: 'modulus'}, notifiers: []});
      done();
    });

    it('with options file', function(done) {
      process.argv = ['node', 'script', '--deployer=s3-static-site', '--options-from=test/utils/cli-test-options.js'];

      var options = cli.getCLIOptions();
      assert.deepEqual(options, {deployer: {service: 'modulus', project: 'myproject'}, notifiers: [{service: 'webhook', body: options.notifiers[0].body}]});
      assert.deepEqual(options.notifiers[0].body('http://review'), {review_url: 'http://reviewtest'});
      done();
    });
  });

  it('.circleciDeploy()', function(done) {
    process.argv = ['node', 'script', '--options-from=test/utils/cli-test-options.js'];

    var mock_circleci = this.sinon.mock(circleci);
    mock_circleci.expects('getDeployerOptions').returns('deployer');
    mock_circleci.expects('getNotifiersOptions').returns('notifiers');

    var mock_qa_deployer = this.sinon.mock(qa_deployer);
    mock_qa_deployer.expects('deploy').withArgs({deployer: 'deployer', notifiers: 'notifiers'}).yields();

    cli.circleciDeploy(done);
  });

  describe('.circleciDeployGitHubPullRequest()', function() {
    beforeEach(function() {
      process.argv = ['node', 'script', '--options-from=test/utils/cli-test-options.js'];

      var mock_circleci = this.sinon.mock(circleci);
      mock_circleci.expects('getGitHubOptions').returns('github');
      mock_circleci.expects('getDeployerOptions').returns('deployer');
      mock_circleci.expects('getNotifiersOptions').returns('notifiers');
    });

    it('with no pull request', function(done) {
      var mock_github_api = this.sinon.mock(github_api);
      mock_github_api.expects('getPullRequestByBranch').withArgs('github').yields();

      var mock_qa_deployer = this.sinon.mock(qa_deployer);
      mock_qa_deployer.expects('withdraw').withArgs({deployer: 'deployer'}).yields();

      cli.circleciDeployGitHubPullRequest(done);
    });

    it('with closed pull request', function(done) {
      var mock_github_api = this.sinon.mock(github_api);
      mock_github_api.expects('getPullRequestByBranch').withArgs('github').yields({state: 'closed'});

      var mock_qa_deployer = this.sinon.mock(qa_deployer);
      mock_qa_deployer.expects('withdraw').withArgs({deployer: 'deployer'}).yields();

      cli.circleciDeployGitHubPullRequest(done);
    });

    it('with open pull request', function(done) {
      var mock_github_api = this.sinon.mock(github_api);
      mock_github_api.expects('getPullRequestByBranch').withArgs('github').yields({state: 'open', number: '12345'});

      var mock_qa_deployer = this.sinon.mock(qa_deployer);
      mock_qa_deployer.expects('deploy').withArgs({deployer: 'deployer', notifiers: 'notifiers'}).yields();

      cli.circleciDeployGitHubPullRequest(done);
    });
  });

  it('.circleciWithdrawClosedGitHubPullRequests()', function(done) {
    process.argv = ['node', 'script', '--options-from=test/utils/cli-test-options.js'];

    var mock_circleci = this.sinon.mock(circleci);
    mock_circleci.expects('getGitHubOptions').returns('github');

    var mock_github_api = this.sinon.mock(github_api);
    mock_github_api.expects('getClosedPullRequests').withArgs('github').yields([{head: {ref: 'branch1'}}, {head: {ref: 'branch2'}}]);

    mock_circleci.expects('getDeployerOptions').withArgs({service: 'modulus', project: 'myproject', github_branches: ['branch1', 'branch2']}).returns('deployer');

    var mock_qa_deployer = this.sinon.mock(qa_deployer);
    mock_qa_deployer.expects('withdraw').withArgs({deployer: 'deployer'}).yields();

    cli.circleciWithdrawClosedGitHubPullRequests(done);
  });
});
