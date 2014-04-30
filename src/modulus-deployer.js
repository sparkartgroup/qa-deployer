var json_request = require('./json-request.js')
var crypto = require('crypto')
var spawn = require('child_process').spawn

var options
var api_url = 'https://api.onmodulus.net'
var user_id
var token
var first_deploy = false

exports.init = function(opts) {
  options = opts

  return {deploy: deploy}
}

var deploy = function(callback) {
  authenticateUser(function() {
    getProject(function(project) {
      if (!project) {
        createProject(function(project) {
          first_deploy = true
          deployProject(project, callback)
        })
      } else {
        deployProject(project, callback)
      }
    })
  })
}

var authenticateUser = function(callback) {
  console.log('Authenticating as "' + options.auth.username + '"...')
  var hashed_password = crypto.createHash('sha512').update(options.auth.password).digest('hex')
  json_request.post(api_url + '/user/authenticate', {form: {login: options.auth.username, password: hashed_password}}, function(body) {
    user_id = body.id
    token = body.authToken

    modulusCommand(['login', '--username', options.auth.username, '--password', options.auth.password], callback)
  })
}

var getProject = function(callback) {
  json_request.get(api_url + '/user/' + user_id + '/projects', {qs: {authToken: token}}, function(body) {
    callback(body.filter(function(project) {return project.name === options.project})[0])
  })
}

var createProject = function(callback) {
  console.log('Creating Modulus project "' + options.project + '"...')
  json_request.post(api_url + '/project/create', {qs: {authToken: token}, form: {name: options.project, creator: user_id}}, callback)
}

var deployProject = function(project, callback) {
  console.log('Deploying to Modulus project "' + project.name + '"...')

  var args = ['deploy', '-p', project.name]
  if (options.include_modules) args.push('--include-modules')

  modulusCommand(args, function() {
    // We need to fetch the project again, to get a fresh domain
    getProject(function(project) {
      if (!project.domain) {
        throw new Error('Project domain is missing')
      } else {
        callback('http://' + project.domain, first_deploy)
      }
    })
  })
}

var modulusCommand = function(args, callback) {
  var child_process = spawn('modulus', args)
  child_process.stdout.pipe(process.stdout)
  child_process.stderr.pipe(process.stderr)
  child_process.on('error', function(err) {
    if (err.message == 'spawn ENOENT') {
      throw new Error("Modulus CLI is missing, install it and try again")
    } else {
      throw err
    }
  })
  child_process.on('close', function(code) {
    if (code > 0) {
      throw new Error("Modulus CLI command returned an error: " + code)
    } else {
      callback()
    }
  })
}
