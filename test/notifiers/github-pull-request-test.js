var assert = require('assert');
var nock = require('nock');

var github_pr = require('../../src/notifiers/github-pull-request.js');

describe('notifiers/github-pull-request.notify()', function() {
  describe('adds a comment to the pull request', function() {
    var options
    var nocks

    beforeEach(function() {
      options = {
        auth: {user: 'me', pass: 'theToken'},
        owner: 'theOwner',
        repo: 'theRepo',
        pull_request: 123
      }
      nocks = []
      nock.disableNetConnect()
    })

    afterEach(function() {
      nocks.forEach(function(item) {
        item.done()
      })
      nock.cleanAll()
      nock.enableNetConnect()
    })

    it('with the default comment', function(done) {
      nocks.push(nock('https://api.github.com').post('/repos/theOwner/theRepo/issues/123/comments', {'body':'**Ready for review at http://review/url**\n\n-------------\nDeployed by [qa-deployer](https://github.com/SparkartGroupInc/qa-deployer)'}).reply(200, {}))

      github_pr.init(options).notify('http://review/url', done)
    })

    it('with a custom comment', function(done) {
      nocks.push(nock('https://api.github.com').post('/repos/theOwner/theRepo/issues/123/comments', {'body':'Review here: http://review/url'}).reply(200, {}))

      options.comment = function(review_url) {return 'Review here: ' + review_url}
      github_pr.init(options).notify('http://review/url', done)
    })
  })
})
