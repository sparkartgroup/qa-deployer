var async = require('async');
var modulus_api = require('../utils/modulus-api.js');
var modulus_cli = require('../utils/modulus-cli.js');

exports.init = function(options) {
  var redeploy;
  var review_url;

  var deploy = function(callback) {
    async.series([authenticateUser, createProjectIfMissing, deployProject], function() {
      callback(redeploy, review_url);
    });
  };

  var withdraw = function(callback) {
    async.series([authenticateUser, stopProject], function() {
      callback();
    });
  };

  var authenticateUser = function(callback) {
    console.log('Authenticating as: ' + options.auth.username);
    modulus_cli.login(options.auth, function() {
      modulus_api.authenticateUser(options.auth, function(user) {
        options.auth.user_id = user.id;
        options.auth.token = user.authToken;
        callback();
      });
    });
  };

  var createProjectIfMissing = function(callback) {
    modulus_api.getProjectByName(options, function(project) {
      if (project) {
        redeploy = true;
        callback();
      } else {
        redeploy = false;
        console.log('Creating Modulus project: ' + options.project);
        modulus_api.createProject(options, function(project) {
          callback();
        });
      }
    });
  };

  var deployProject = function(callback) {
    console.log('Deploying to Modulus project: ' + options.project);
    modulus_cli.deploy(options, function() {
      // We need to fetch the project again, to get a fresh domain
      modulus_api.getProjectByName(options, function(project) {
        if (!project.domain) throw new Error('Project domain is missing');

        review_url = 'http://' + project.domain;
        callback();
      });
    });
  };

  var stopProject = function(callback) {
    console.log('Stopping Modulus project: ' + options.project);
    modulus_api.getProjectByName(options, function(project) {
      if (project && project.status === 'RUNNING') {
        modulus_api.stopProject(options, project, function() {
          callback();
        });
      } else {
        callback();
      }
    });
  };

  return {deploy: deploy, withdraw: withdraw, options: options};
};
