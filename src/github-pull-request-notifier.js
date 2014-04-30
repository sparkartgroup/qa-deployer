var json_request = require('./json-request.js')

var options
var api_url
var auth
var headers = {'User-Agent': 'qa-deployer'}

exports.init = function(opts) {
  options = opts
  api_url = 'https://api.github.com/repos/' + options.owner + '/' + options.repo
  auth = {user: options.auth.user, pass: options.auth.token, sendImmediately: true}

  return {validate: validate, notify: notify}
}

var validate = function(callback) {
  getPullRequest(function(pull_request) {
    if (pull_request) {
      callback()
    } else {
      console.log('Can\'t find GitHub pull request for "' + options.branch + '", aborting.')
    }
  })
}

var notify = function(url, callback) {
  console.log('Notifying GitHub pull request for "' + options.branch + '"')
  getPullRequest(function(pull_request) {
    commentPullRequest(pull_request, url, callback)
  })
}

var getPullRequest = function(callback) {
  json_request.get(api_url + '/pulls', {auth: auth, headers: headers}, function(body) {
    callback(body.filter(function(pull_request) {return pull_request.head.ref === options.branch})[0])
  })
}

var commentPullRequest = function(pull_request, url, callback) {
  var comment = '**Ready for review at ' + url + '**\n\n-------------\n' + (options.signature || 'Deployed by [qa-deployer](https://github.com/SparkartGroupInc/qa-deployer)')
  json_request.post(api_url + '/issues/' + pull_request.number + '/comments', {auth: auth, headers: headers, body: {body: comment}}, callback)
}
