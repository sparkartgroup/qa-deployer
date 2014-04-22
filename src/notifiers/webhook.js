var json_request = require('../utils/json-request.js')

exports.init = function(options) {
  var notify = function(review_url, callback) {
    var body
    if (options.body) {
      body = options.body(review_url)
    } else {
      body = {review_url: review_url}
    }

    console.log('Notifying webhook: ' + options.url)
    json_request.post(options.url, {body: body}, function(body) {
      callback()
    })
  }

  return {notify: notify, options: options}
}
