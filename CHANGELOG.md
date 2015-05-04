## 2.2.1 (May 4, 2015)

 - Do not withdraw the project for the branch of a closed pull request if that branch also has another open pull request [[8b95857](https://github.com/SparkartGroupInc/qa-deployer/commit/8b958579ffc7620d82c153dc69a86cf83ef9f1b5)]

## 2.2.0 (May 1, 2015)

 - Add `method` and `headers` options to webhook notifier [[d02c723](https://github.com/SparkartGroupInc/qa-deployer/commit/d02c723cf8961a180ea2812bd298289248e633f8)]
 - Add circleci-withdraw-closed-github-pull-requests script [[6b50d0e](https://github.com/SparkartGroupInc/qa-deployer/commit/6b50d0e0ed8dd3230e59455a7c73271db32d5742)]

## 2.1.1 (Feb 23, 2015)

 - Use latest s3-site [[9abaf3b](https://github.com/SparkartGroupInc/qa-deployer/commit/9abaf3b9b56b450848c533a95d9771fce6dd0a39)]

## 2.1.0 (Feb 16, 2015)

 - Default deployer target name [[dd3dc06](https://github.com/SparkartGroupInc/qa-deployer/commit/dd3dc0678a34d658375f337cad90964f83891978)]

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
