var spawn = require('child_process').spawn;
var modulus = require.resolve('modulus/bin/modulus');

exports.login = function(options, callback) {
  exports.command(['login', '--username', options.username, '--password', options.password], callback);
};

exports.deploy = function(options, callback) {
  var args = ['deploy', '-p', options.project];
  if (options.include_modules) {
    args.push('--include-modules');
  }

  exports.command(args, callback);
};

exports.delete = function(options, callback) {
  exports.command(['project', 'delete', '-p', options.project], callback);
};

exports.command = function(args, callback) {
  var child_process = spawn(modulus, args);

  child_process.stdout.pipe(process.stdout);
  child_process.stderr.pipe(process.stderr);

  child_process.on('error', function(err) {
    if (err.message == 'spawn ENOENT') {
      throw new Error("Modulus CLI is missing, install it and try again");
    } else {
      throw err;
    }
  });

  child_process.on('close', function(code) {
    if (code > 0) {
      throw new Error("Modulus CLI command returned an error: " + code);
    } else {
      callback();
    }
  });
};
