var github_api = require('../utils/github-api.js');

exports.init = function(options) {
  var notify = function(review_url, callback) {
    var comment;
    if (options.comment) {
      comment = options.comment(review_url);
    } else {
      comment = '**Ready for review at ' + review_url + '**\n\n-------------\nDeployed by [qa-deployer](https://github.com/SparkartGroupInc/qa-deployer)';
    }

    console.log('Notifying GitHub pull request: ' + options.pull_request);
    github_api.commentPullRequest(options, comment, function(body) {
      callback();
    });
  };

  return {notify: notify, options: options};
};
