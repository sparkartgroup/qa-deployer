var json_request = require('./json-request.js');

exports.getPullRequestByBranch = function(options, callback) {
  json_request.get(apiUrl(options, 'pulls?state=all&head=' + encodeURIComponent(options.owner + ':' + options.branch)), {auth: options.auth}, function(body) {
    callback(body[0]);
  });
};

exports.getClosedPullRequestsBranches = function(options, callback) {
  json_request.get(apiUrl(options, 'pulls?state=closed&per_page=100'), {auth: options.auth}, function(closed) {
    json_request.get(apiUrl(options, 'pulls?state=open&per_page=100'), {auth: options.auth}, function(open) {
      // Do not return the branch of a closed pull request if that branch also has another open pull request
      closed = closed.map(function(pr) {return pr.head.ref});
      open   = open.map(function(pr) {return pr.head.ref});
      callback(closed.filter(function(b) {return open.indexOf(b) === -1}));
    });
  });
};

exports.commentPullRequest = function(options, comment, callback) {
  json_request.post(apiUrl(options, 'issues/' + options.pull_request + '/comments'), {auth: options.auth, body: {body: comment}}, callback);
};

var apiUrl = function(options, endpoint) {
  return 'https://api.github.com/repos/' + options.owner + '/' + options.repo + '/' + endpoint;
};
