# qa-deployer -- Deploy a package to a hosting service for easy review

This package is used to easily deploy the contents of the current directory to an external service, and then send a deployment notification. The module is used by specifying a deployer and a notifier:

```
var qa_deployer = require('qa-deployer')

qa_deployer.deploy({
  deployer: {
    service: 'modulus',
    auth: {username: 'me', password: '12345'},
    project: 'my-new-feature'
  },
  notifier: {
    service: 'github-pull-request',
    auth: {user: 'me', token: '12345'},
    owner: 'SparkartGroupInc',
    repo: 'qa-deployer',
    branch: 'my-new-feature'
  }
})
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

## Available Notifiers ##

### github-pull-request ###

Adds a comment to the specified [GitHub](https://github.com/) branch's pull request with the deployed URL. If the pull request cannot be found, the deploy will not occur.

*Usage*

 - `auth` - An object with the GitHub account's `user` and `token`.
 - `owner` - The owner of the repo containing the branch to comment on.
 - `repo` - The repo containing the branch to comment on.
 - `branch` - The branch to comment on.
 - `signature` - Custom signature for the comment. Optional, defaults to a link to this repo.

## Available Scripts ##

### circleci-modulus-deploy ###

Use with [CircleCI](https://circleci.com/) to automatically deploy when a branch is created or modified. Uses the `modulus` deployer (with the current branch name as the project name) and the `github-pull-request` notifier.

*Usage*

Required environment variables:

 - `MODULUS_USERNAME`
 - `MODULUS_PASSWORD`
 - `GITHUB_USER`
 - `GITHUB_TOKEN`

Command line options:

 - `--include-modules`

Example `circle.yml` configuration file:

```
dependencies:
  post:
    - npm install qa-deployer -g
    - npm install modulus -g
deployment:
  qa:
    branch: /^(?!master$)/
    commands:
      - circleci-modulus-deploy
```
