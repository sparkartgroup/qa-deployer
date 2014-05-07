exports.deploy = function(options, callback) {
  var deployer = getDeployer(options)
  var notifier = getNotifier(options)

  notifier.validate(function() {
    deployer.deploy(function(url, first_deploy) {
      if (first_deploy) {
        notifier.notify(url, function() {})
      }
    })
  })
}

var getDeployer = function(options) {
  options.deployer = options.deployer || {}
  if (options.deployer.service == 'modulus') {
    return require('./src/modulus-deployer.js').init(options.deployer)
  } else {
    throw new Error('Invalid deployer service')
  }
}

var getNotifier = function(options) {
  options.notifier = options.notifier || {}
  if (options.notifier.service == 'github-pull-request') {
    return require('./src/github-pull-request-notifier.js').init(options.notifier)
  } else {
    throw new Error('Invalid notifier service')
  }
}
