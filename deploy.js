var ORG = process.env.CIRCLE_PROJECT_USERNAME,
    REPO = process.env.CIRCLE_PROJECT_REPONAME,
    BRANCH = process.env.CIRCLE_BRANCH,
    MODULUS_USERNAME = process.env.MODULUS_USERNAME,
    MODULUS_PASSWORD = process.env.MODULUS_PASSWORD,
    GITHUB_USER = process.env.GITHUB_USER,
    GITHUB_TOKEN = process.env.GITHUB_TOKEN

var spawn = require('child_process').spawn,
    request = require('request'),
    color = require('cli-color'),
    crypto = require('crypto'),
    Sync = require('sync')

var modulus_user_id,
    modulus_token,
    user_agent = { "User-Agent": "Sparkart Site Deployer" },
    github_auth = { "user": GITHUB_USER, "pass": GITHUB_TOKEN, "sendImmediately": true }

var update = color.xterm(44),
    success = color.xterm(49),
    error = color.xterm(202),
    warn = color.xterm(220)

var authenticateModulusUser = function() {
  var hashed_password = crypto.createHash('sha512').update(MODULUS_PASSWORD).digest('hex')
  var body = srequest(
    'https://api.onmodulus.net/user/authenticate',
    {method: 'POST', json: true, form: {login: MODULUS_USERNAME, password: hashed_password}})

  modulus_user_id = body.id
  modulus_token = body.authToken
}

var getModulusProject = function() {
  var body = srequest(
    'https://api.onmodulus.net/user/' + modulus_user_id + '/projects',
    {json: true, qs: {authToken: modulus_token}})

  return body.filter(function(project) {return project.name === BRANCH})[0]
}

var createModulusProject = function() {
  srequest(
    'https://api.onmodulus.net/project/create',
    {method: 'POST', json: true, qs: {authToken: modulus_token}, form: {name: BRANCH, creator: modulus_user_id}})
}

var deployBranch = function(callback) {
  var args = ['deploy', '-p', BRANCH]
  if (BRANCH == 'master') {
    args.push('--include-modules')
  }

  var deploy = spawn('modulus', args)
  var waiter = new Sync.Future()

  deploy.stdout.pipe(process.stdout)
  deploy.stderr.pipe(process.stderr)
  deploy.on('close', function(code) {
    if (code > 0) throw new Error("Can't deploy to Modulus: " + code)
    waiter() // Deploy is done
  })

  waiter.result // Wait until deploy is done
}

var addProjectUrlToPullRequest = function() {
  var url = "http://" + getModulusProject().domain
  var pull_request = getPullRequest();
  if (!pull_request) throw new Error("Can't find pull request")
  commentPullRequest(pull_request, 'Your branch is ready for review at ' + url + '.\n\n~ Your Friendly Site Deployer')
}

var getPullRequest = function() {
  var body = srequest(
    'https://api.github.com/repos/' + ORG + '/' + REPO + '/pulls',
    {json: true, auth: github_auth, headers: user_agent})

  return body.filter(function(pull_request) {return pull_request.head.ref === BRANCH})[0]
}

var commentPullRequest = function(pull_request, body) {
  srequest(
    'https://api.github.com/repos/' + ORG + '/' + REPO + '/issues/' + pull_request.number + '/comments',
    {method: 'POST', json: true, auth: github_auth, headers: user_agent, body: {body: body}},
    201)
}

var srequest = function(url, options, status_code) {
  var response = request.sync(null, url, options)[0]
  if (response.statusCode != (status_code || 200) || response.body.errors) throw new Error(JSON.stringify(response.body))
  return response.body
}

Sync(function() {

  console.log(update('Authenticating as ' + MODULUS_USERNAME))
  authenticateModulusUser()

  console.log(update('Looking for ' + BRANCH + ' project'))
  if (getModulusProject()) {
    console.info(warn('Deploying'))
    deployBranch()
  } else {
    console.log(warn('Project not found, creating'))
    createModulusProject()

    console.info(warn('Deploying'))
    deployBranch()

    console.log(warn('Adding comment to pull request'))
    addProjectUrlToPullRequest()
  }

}, function(err) {if(err) throw err}
)
