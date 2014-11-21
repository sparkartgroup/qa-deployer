module.exports.getGitHubOptions = function(options) {
  options || (options = {});
  options.owner  || (options.owner = getEnv('CIRCLE_PROJECT_USERNAME'));
  options.repo   || (options.repo = getEnv('CIRCLE_PROJECT_REPONAME'));
  options.branch || (options.branch = getEnv('CIRCLE_BRANCH'));
  options.auth   || (options.auth = {});
  options.auth.user || (options.auth.user = getEnv('GITHUB_USER'));
  options.auth.pass || (options.auth.pass = getEnv('GITHUB_PASS'));
  return options;
};

module.exports.getDeployerOptions = function(options) {
  switch (options.service) {
  case 'modulus':
    options.project || (options.project = getEnv('CIRCLE_BRANCH'));
    options.auth    || (options.auth = {});
    options.auth.username || (options.auth.username = getEnv('MODULUS_USERNAME'));
    options.auth.password || (options.auth.password = getEnv('MODULUS_PASSWORD'));
    break;
  case 's3-static-website':
    options.bucket_name || (options.bucket_name = getBucketName([getEnv('CIRCLE_PROJECT_USERNAME'), getEnv('CIRCLE_PROJECT_REPONAME'), getEnv('CIRCLE_BRANCH')]));
    options.s3_options  || (options.s3_options = {});
    options.s3_options.accessKeyId     || (options.s3_options.accessKeyId = getEnv('AWS_ACCESS_KEY_ID'));
    options.s3_options.secretAccessKey || (options.s3_options.secretAccessKey = getEnv('AWS_SECRET_ACCESS_KEY'));
    break;
  }
  return options;
};

module.exports.getNotifierOptions = function(options, pull_request) {
  switch (options.service) {
  case 'github-pull-request':
    options = module.exports.getGitHubOptions(options);
    options.pull_request || (options.pull_request = pull_request.number);
    options.comment      || (options.comment = function(review_url) {
      return '**Ready for review at ' + review_url + '**\n\n-------------\nAutomatically deployed by CircleCI using [qa-deployer](https://github.com/SparkartGroupInc/qa-deployer)';
    });
    break;
  case 'webhook':
    options.body || (options.body = function(review_url) {
      github_options = module.exports.getGitHubOptions();
      var body = {
        github_owner:  github_options.owner,
        github_repo:   github_options.repo,
        github_branch: github_options.branch,
        github_push: {
          compare_url: process.env['CIRCLE_COMPARE_URL'],
          username:    process.env['CIRCLE_USERNAME']
        },
        review_url: review_url
      };
      if (pull_request) {
        body.github_pull_request = {
          url:   pull_request.html_url,
          title: pull_request.title
        };
      }
      return body;
    });
    break;
  }
  return options;
};

module.exports.getNotifiersOptions = function(notifiers, pull_request) {
  return notifiers.map(function(options) {
    return module.exports.getNotifierOptions(options, pull_request);
  });
};

var getEnv = function(name) {
  if (!process.env[name]) {
    throw new Error('Missing environment variable: ' + name);
  } else {
    return process.env[name];
  }
};

var getBucketName = function(parts) {
  return parts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/(^-|-$)/g, '').substring(0, 63).replace(/-$/, '');
};
