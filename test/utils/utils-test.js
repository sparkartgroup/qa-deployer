var assert = require('assert');
var path   = require('path');

var utils = require('../../src/utils/utils');

describe('utils/utils', function() {
  describe('.cwdName()', function() {
    var cwd = process.cwd();

    afterEach(function() {
      process.chdir(cwd);
    });

    it('returns the cwd name', function(done) {
      process.chdir(__dirname);
      assert.equal(utils.cwdName(), 'utils');
      done();
    });
  });
});
