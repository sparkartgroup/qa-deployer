var fs        = require('fs');
var parseArgs = require('minimist');
var path      = require('path');

var circleci    = require('./circleci');
var github_api  = require('./github-api');
var qa_deployer = require('../../qa-deployer');

module.exports.getCLIOptions = function() {
  var args    = parseArgs(process.argv);
  var options = args['options-from'] ? require('./' + path.relative(__dirname, path.resolve(process.cwd(), args['options-from']))) : {};

  options.deployer || (options.deployer = {});
  options.deployer.service || (options.deployer.service = args['deployer']);
  options.notifiers || (options.notifiers = []);

  return options;
};

module.exports.circleciDeploy = function(callback) {
  var cli_options = module.exports.getCLIOptions();
  var qa_deployer_options = {
    deployer:  circleci.getDeployerOptions(cli_options.deployer),
    notifiers: circleci.getNotifiersOptions(cli_options.notifiers)
  };

  qa_deployer.deploy(qa_deployer_options, function(redeploy, review_url) {
    console.log(redeploy ? 'Redeployed to' : 'Deployed to', review_url);
    if (callback) callback();
  });
};

module.exports.circleciDeployGitHubPullRequest = function(callback) {
  var cli_options    = module.exports.getCLIOptions();
  var github_options = circleci.getGitHubOptions();
  var qa_deployer_options = {
    deployer: circleci.getDeployerOptions(cli_options.deployer)
  };

  console.log('Retrieving GitHub pull request for branch: ' + github_options.branch);
  github_api.getPullRequestByBranch(github_options, function(pull_request) {
    if (!pull_request || pull_request.state === 'closed') {
      console.log(pull_request ? 'GitHub pull request is closed' : "Can't find GitHub pull request");
      qa_deployer.withdraw(qa_deployer_options, function() {
        console.log('Withdrawn');
        if (callback) callback();
      });
    } else {
      qa_deployer_options.notifiers = circleci.getNotifiersOptions(cli_options.notifiers, pull_request);
      qa_deployer.deploy(qa_deployer_options, function(redeploy, review_url) {
        console.log(redeploy ? 'Redeployed to' : 'Deployed to', review_url);
        if (callback) callback();
      });
    }
  });
};
