var json_request = require('./json-request.js')
var crypto = require('crypto')

exports.authenticateUser = function(options, callback) {
  var hashed_password = crypto.createHash('sha512').update(options.password).digest('hex')
  json_request.post(apiUrl('user/authenticate'), {form: {login: options.username, password: hashed_password}}, callback)
}

exports.getProjectByName = function(options, callback) {
  json_request.get(apiUrl('user/' + options.auth.user_id + '/projects'), {qs: {authToken: options.auth.token}}, function(body) {
    callback(body.filter(function(project) {return project.name === options.project})[0])
  })
}

exports.createProject = function(options, callback) {
  json_request.post(apiUrl('project/create'), {qs: {authToken: options.auth.token}, form: {name: options.project, creator: options.auth.user_id}}, callback)
}

exports.stopProject = function(options, project, callback) {
  json_request.get(apiUrl('project/' + project.id + '/stop'), {qs: {authToken: options.auth.token}}, callback)
}

var apiUrl = function(endpoint) {
  return 'https://api.onmodulus.net/' + endpoint
}
