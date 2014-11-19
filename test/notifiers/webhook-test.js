var assert = require('assert');
var nock = require('nock');

var webhook = require('../../src/notifiers/webhook.js');

describe('notifiers/webhook.notify()', function() {
  describe('posts to the webhook url', function() {
    var options;
    var nocks;

    beforeEach(function() {
      options = {
        url: 'http://webhook/url'
      };
      nocks = [];
      nock.disableNetConnect();
    });

    afterEach(function() {
      nocks.forEach(function(item) {
        item.done();
      });
      nock.cleanAll();
      nock.enableNetConnect();
    })

    it('with the default body', function(done) {
      nocks.push(nock('http://webhook').post('/url', {review_url: 'http://review/url'}).reply(200, {}));

      webhook.init(options).notify('http://review/url', done);
    });

    it('with a custom body', function(done) {
      nocks.push(nock('http://webhook').post('/url', {a: 'http://review/url', b: 'test'}).reply(200, {}));

      options.body = function(review_url) {return {a: review_url, b: 'test'}};
      webhook.init(options).notify('http://review/url', done);
    });
  });
});
