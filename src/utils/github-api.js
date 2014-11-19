var json_request = require('./json-request.js');

exports.getPullRequestByBranch = function(options, callback) {
  json_request.get(apiUrl(options, 'pulls?state=all&head=' + encodeURIComponent(options.owner + ':' + options.branch)), {auth: options.auth}, function(body) {
    callback(body[0]);
  });
};

exports.commentPullRequest = function(options, comment, callback) {
  json_request.post(apiUrl(options, 'issues/' + options.pull_request + '/comments'), {auth: options.auth, body: {body: comment}}, callback);
};

var apiUrl = function(options, endpoint) {
  return 'https://api.github.com/repos/' + options.owner + '/' + options.repo + '/' + endpoint;
};
