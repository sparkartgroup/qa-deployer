var path = require('path');

module.exports.cwdName = function() {
  return path.basename(process.cwd());
};
