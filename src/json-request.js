var request = require('request')

exports.get = function(url, options, callback) {
  options.json = true
  request.get(url, options, validateResponse(callback))
}

exports.post = function(url, options, callback) {
  options.json = true
  request.post(url, options, validateResponse(callback))
}

var validateResponse = function(callback) {
  return function(error, response, body) {
    if (error || (response.statusCode != 200 && response.statusCode != 201) || body.errors) {
      throw new Error(JSON.stringify(error || body))
    } else {
      callback(body)
    }
  }
}
