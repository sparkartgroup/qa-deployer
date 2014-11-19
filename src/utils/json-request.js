var request = require('request');

exports.get = function(url, options, callback) {
  request.get(url, requestOptions(options), validateResponse(callback));
};

exports.post = function(url, options, callback) {
  request.post(url, requestOptions(options), validateResponse(callback));
};

var requestOptions = function(options) {
  options.json = true;
  options.headers = options.headers || {};
  options.headers['User-Agent'] = options.headers['User-Agent'] || 'qa-deployer';
  return options;
};

var validateResponse = function(callback) {
  return function(error, response, body) {
    if (error || (response.statusCode != 200 && response.statusCode != 201) || body.errors) {
      throw new Error(JSON.stringify(error || body));
    } else {
      callback(body);
    }
  };
};
