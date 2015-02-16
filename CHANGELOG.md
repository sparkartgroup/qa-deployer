## Unreleased

 - Default deployer target name

## 2.0.1 (Jan 16, 2015)

 - Install modulus-cli automatically [[1602923](https://github.com/SparkartGroupInc/qa-deployer/commit/16029235146e21a86cc2933ea1e0863bf412e627)]

## 2.0.0 (Dec 12, 2014)

 - s3-static-website deployer [[d8e176a](https://github.com/SparkartGroupInc/qa-deployer/commit/d8e176a56b24e9281bcae6fa296c1f25b8838d6e)]

BREAKING CHANGES:

 - The `circleci-deploy-github-pull-request-to-modulus` script is renamed to `circleci-deploy-github-pull-request`, and now requires the deployer service to be specified with the `--deployer=SERVICE` command line option or in the `--options-from=FILE` options file (as `{"deployer": {"service": "SERVICE"}}`).

## 1.0.0 (Nov 19, 2014)

 - Stop/delete project after PR is merged [[870b9ed](https://github.com/SparkartGroupInc/qa-deployer/commit/870b9ed1e65f222de61ec8f915678eb78a5af9db)]

## 0.0.1 (May 12, 2014)

 - Initial release
