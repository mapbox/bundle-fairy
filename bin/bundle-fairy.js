#!/usr/bin/env node

var minimist = require('minimist');
var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var fairy = require('..');

function usage() {
    console.error('Usage: bundle-fairy <isbundle|extract> <zipfile>');
    console.error('');
    console.error('Options:');
    console.error(' -o, --outfile: specify an output file path');
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

fs.open(zipfile, 'r', function(err, fd) {
    if (err) { throw err; }
    var buf = new Buffer(2);
    fs.read(fd, buf, 0, 2, 0, function(err, bytes_read, data) {
        if (err) { throw err; }
        data = data.toString();
        fs.close(fd, function(err) {
            if (err) { return usage_and_exit(err);}
            if (data !== 'PK') { return usage_and_exit('Not a zipfile.'); }
            fairy[cmd](zipfile, function(err, result) {
                console.log('err:', err);
                console.log('result:', result);
            });
        });
    });
});
