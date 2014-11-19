var assert = require('assert');
var sinon = require('sinon');

var modulus = require('../src/deployers/modulus.js');
var github_pr = require('../src/notifiers/github-pull-request.js');
var webhook = require('../src/notifiers/webhook.js');

var qa_deployer = require('../qa-deployer.js');

describe('qa-deployer', function() {
  var options = {
    deployer: {service: 'modulus'},
    notifiers: [
      {service: 'github-pull-request'},
      {service: 'webhook', notify_redeploys: true}
    ]
  }
  var modulus_init = modulus.init
  var github_pr_init = github_pr.init
  var webhook_init = webhook.init
  var sinons
  var expectations

  beforeEach(function() {
    sinons = sinon.sandbox.create()
    expectations = []
  })

  afterEach(function() {
    sinons.restore()
    expectations.forEach(function(item) {
      item.verify()
    })
  })

  describe('deploy()', function() {
    it('deploys and notifies', function(done) {
      sinons.stub(modulus, 'init', function() {
        var deployer = modulus_init.apply(this, arguments)
        expectations.push(sinons.mock(deployer).expects('deploy').yields(false, 'http://review/url'))
        return deployer
      })
      sinons.stub(github_pr, 'init', function() {
        var notifier = github_pr_init.apply(this, arguments)
        expectations.push(sinons.mock(notifier).expects('notify').yields())
        return notifier
      })
      sinons.stub(webhook, 'init', function() {
        var notifier = webhook_init.apply(this, arguments)
        expectations.push(sinons.mock(notifier).expects('notify').yields())
        return notifier
      })

      qa_deployer.deploy(options, done)
    })

    it('deploys and notifies a redeploy', function(done) {
      sinons.stub(modulus, 'init', function() {
        var deployer = modulus_init.apply(this, arguments)
        expectations.push(sinons.mock(deployer).expects('deploy').yields(true, 'http://review/url'))
        return deployer
      })
      sinons.stub(github_pr, 'init', function() {
        var notifier = github_pr_init.apply(this, arguments)
        expectations.push(sinons.mock(notifier).expects('notify').yields().never())
        return notifier
      })
      sinons.stub(webhook, 'init', function() {
        var notifier = webhook_init.apply(this, arguments)
        expectations.push(sinons.mock(notifier).expects('notify').yields())
        return notifier
      })

      qa_deployer.deploy(options, done)
    })
  })

  describe('.withdraw()', function() {
    it('withdraws', function(done) {
      sinons.stub(modulus, 'init', function() {
        var deployer = modulus_init.apply(this, arguments)
        expectations.push(sinons.mock(deployer).expects('withdraw').yields())
        return deployer
      })

      qa_deployer.withdraw(options, done)
    })
  })
})
