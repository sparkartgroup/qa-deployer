var assert = require('assert');
var sinon  = require('sinon');

var json_request = require('../../src/utils/json-request');
var github_api = require('../../src/utils/github-api');

describe('utils/github-api', function() {
  var mock_json_request;

  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    mock_json_request = this.sinon.mock(json_request);
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('.getClosedPullRequestsBranches()', function() {
    it('returns the branch names from closed pull requests', function(done) {
      mock_json_request.expects('get').withArgs('https://api.github.com/repos/o/r/pulls?state=closed&per_page=100', {auth: 'a'}).yields([{head: {ref: 'branch1'}}, {head: {ref: 'branch2'}}, {head: {ref: 'branch3'}}]);
      mock_json_request.expects('get').withArgs('https://api.github.com/repos/o/r/pulls?state=open&per_page=100', {auth: 'a'}).yields([{head: {ref: 'branch2'}}, {head: {ref: 'branch4'}}]);

      github_api.getClosedPullRequestsBranches({owner: 'o', repo: 'r', auth: 'a'}, function(branches) {
        assert.deepEqual(branches, ['branch1', 'branch3']);
        done();
      });
    });
  });
});
