var async = require('async');

exports.deploy = function(options, callback) {
  var deployer = getDeployer(options.deployer);
  var notifiers = getNotifiers(options.notifiers);

  deployer.deploy(function(redeploy, review_url) {
    async.each(notifiers, function(notifier, callback) {
      if (redeploy && !notifier.options.notify_redeploys) return callback();

      notifier.notify(review_url, callback);
    }, function() {
      if (callback) {
        callback(redeploy, review_url);
      }
    });
  });
};

exports.withdraw = function(options, callback) {
  var deployer = getDeployer(options.deployer);

  deployer.withdraw(callback || function() {});
};

var getDeployer = function(options) {
  options = options || {};
  switch(options.service) {
  case 'modulus':
  case 's3-static-website':
    return require('./src/deployers/' + options.service).init(options);
  default:
    throw new Error('Invalid deployer service: ' + options.service);
  }
};

var getNotifiers = function(options) {
  var notifiers = [];
  options = options || [];
  options.forEach(function(notifier) {
    notifiers.push(getNotifier(notifier));
  });
  return notifiers;
};

var getNotifier = function(options) {
  options = options || {};
  switch(options.service) {
  case 'github-pull-request':
  case 'webhook':
    return require('./src/notifiers/' + options.service).init(options);
  default:
    throw new Error('Invalid notifier service: ' + options.service);
  }
};
