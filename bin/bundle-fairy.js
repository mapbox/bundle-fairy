#!/usr/bin/env node

var minimist = require('minimist');
var fs = require('fs');
var fairy = require('..');

function usage() {
  console.error('Usage: bundle-fairy <isbundle|extract> <zipfile>');
  console.error('');
  console.error('Options:');
  console.error(' -o, --outfile: specify an output file path');
  console.error(' -d, --dirname: (only for extract) output just the directory name instead of a list of bundled files');
  console.error(' -v, --verbose: verbose error messages');
  console.error(' -h, --help: show this message');
  console.error('');
}

function usage_and_exit(msg) {
  usage();
  console.error(msg + '\n');
  process.exit(1);
}

var args = minimist(process.argv.slice(2));

if (args.h || args.help) { usage_and_exit(''); }

var cmd = args._[0];
if (!cmd) { usage_and_exit('No command.'); }
cmd = cmd.toLowerCase();
if (cmd !== 'isbundle' && cmd !== 'extract') { usage_and_exit('Unrecognized command: ' + cmd); }

var zipfile = args._[1];
if (!zipfile) { usage_and_exit('No zipfile.'); }
if (!fs.existsSync(zipfile)) { usage_and_exit('Zipfile does not exist: ' + zipfile); }

var options = {};
options.dirname = args.d || args.dirname || false;

//result:
//* true|false if command is 'isbundle'
//* [] of extracted file names/layers
fairy[cmd](zipfile, options, function(err, result) {
  if (err) return fail(err);
  console.log(result);
});

function fail(err) {
  console.error(err.message);
  process.exit(err.code === 'EINVALID' ? 3 : 1);
}
