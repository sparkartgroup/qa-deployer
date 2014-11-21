# qa-deployer -- Deploy a package to a hosting service for easy review

This package is used to easily deploy the contents of the current directory to an external service, and then optionally send one or more deployment notification.

The easiest way to use this package is with a [CLI script](#available-scripts) (or writing your own). The module is used by specifying a deployer and notifiers:

```javascript
var qa_deployer = require('qa-deployer');

qa_deployer.deploy({
  deployer: {
    service: 'modulus',
    auth: {username: 'me', password: '12345'},
    project: 'my-new-feature'
  },
  notifiers: [{
    service: 'github-pull-request',
    auth: {user: 'me', pass: '12345'},
    owner: 'SparkartGroupInc',
    repo: 'qa-deployer',
    pull_request: 1,
    comment: function(review_url) {
      return 'Ready for review at ' + review_url;
    }
  }]
});
```

## Available Deployers ##

### modulus ###

Deploys the current package to [Modulus](https://modulus.io/).

*Requirements*

 - The [Modulus CLI](https://github.com/onmodulus/modulus-cli) needs to be installed first.

*Usage*

 - `auth` - An object with the Modulus account's `username` and `password`.
 - `project` - The Modulus project where to upload the package. If the project is missing, it will be automatically created.
 - `include_modules` - Whether to upload the `node_modules` folder. Optional, defaults to `false`.

### s3-static-website ###

Deploys the current directory to [Amazon S3](http://aws.amazon.com/s3/) as a [static website](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html).

*Usage*

 - `s3_options` - An object used to configure the connection to S3. See the `AWS.S3` [documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).
 - `bucket_name` - The S3 bucket where to upload the files. If the bucket is missing, it will be automatically created and configured to host the static website.
 - `region` - The AWS region where the site will be hosted. Optional, defaults to `us-east-1`.
 - `removeExtensions` - List of extensions to remove from uploaded files, for example `['.html', '.htm']`. Optional.
 - `indexDocument` - Default index document when a folder is requested from S3. Optional, defaults to `index.html`.

## Available Notifiers ##

### github-pull-request ###

Adds a comment to the specified [GitHub](https://github.com/) pull request with the deployed URL.

*Usage*

 - `auth` - An object with the GitHub account's `user` and `pass`. The `pass` is a [token](https://github.com/blog/1509-personal-api-tokens) which needs to have access to either the `repo` or `public_repo` [scopes](https://developer.github.com/v3/oauth/#scopes).
 - `owner` - The owner of the repo containing the pull request to comment on.
 - `repo` - The repo containing the pull request to comment on.
 - `pull_request` - The pull request number to comment on.
 - `notify_redeploys` - Whether to notify after the first deploy to the deployer service. Optional, defaults to `false`.
 - `comment` - A function called with the `review_url` as an argument, that returns the comment to add. Optional.

### webhook ###

POSTs the deployed URL to a webhook URL, as JSON.

*Usage*

 - `url` - The webhook URL to POST to.
 - `notify_redeploys` - Whether to notify after the first deploy to the deployer service. Optional, defaults to `false`.
 - `body` - A function called with the `review_url` as an argument, that returns the JavaScript object to POST. Optional, defaults to `{review_url: <review_url>}`.

## Available Scripts ##

### circleci-deploy ###

Called by [CircleCI](https://circleci.com/), it automatically deploys a branch when a commit is made.

The following deployers are supported:

 - `modulus` - The GitHub branch name is used as the Modulus project name.
 - `s3-static-website` - The GitHub organization, repository and branch names are used as the S3 bucket name.

Notifiers can be enabled by adding an options file. This JSON formatted file can contain deployer and notifier options, similar to the module usage above. For example:

```json
{
  "deployer": {
    "service": "modulus",
    "include_modules": true
  },
  "notifiers": [
    {"service": "github-pull-request"},
    {"service": "webhook", "url": "http://my-webhook", "notify_redeploys": true}
  ]
}
```

The file can also be a Node module:

```javascript
module.exports = {
  deployer: {
    service: 'modulus',
    include_modules: true
  },
  notifiers: [
    {service: 'github-pull-request'},
    {service: 'webhook', url: 'http://my-webhook', notify_redeploys: true}
  ]
};
```

*Usage*

Required environment variables:

 - `GITHUB_USER`
 - `GITHUB_PASS`

With the `modulus` deployer:

 - `MODULUS_USERNAME`
 - `MODULUS_PASSWORD`

With the `s3-static-website` deployer:

 - `AWS_ACCESS_KEY_ID`
 - `AWS_SECRET_ACCESS_KEY`

Command line options:

 - `--deployer=SERVICE` - The deployer to use. Optional, can also be set from the options file.
 - `--options-from=FILE` - Read additional options from JSON formatted FILE.

Example `circle.yml` configuration file:

```yaml
dependencies:
  post:
    - npm install qa-deployer -g
    - npm install modulus -g
deployment:
  production:
    branch: master
    commands:
      - circleci-deploy --options-from=production-deployer.json
```

### circleci-deploy-github-pull-request ###

Similar to the `circleci-deploy` script, but will only deploy when an open GitHub pull request exists for the current branch. If not, the branch will not be deployed, and will be withdrawn from the deployer service instead.

Note: CircleCI will only trigger new builds when a commit is made to an existing pull request. To deploy a branch when a pull request is created (without pushing an extra commit), the [CircleCI API](https://circleci.com/docs/api#new-build) needs to be called. On way to automatically do this is to create a [PullRequestEvent Webhook](https://developer.github.com/v3/activity/events/types/#pullrequestevent) in the GitHub project's settings. This Webhook will POST to a relay service, such as [Zapier](http://www.zapier.com), which will in turn POST to the appropriate CircleCI API URL.

Example `circle.yml` configuration file:

```yaml
dependencies:
  post:
    - npm install qa-deployer -g
    - npm install modulus -g
deployment:
  qa:
    branch: /^(?!master$)(.+)/
    commands:
      - circleci-deploy-github-pull-request --options-from=qa-deployer.json
```
