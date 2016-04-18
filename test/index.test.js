var test = require('tape');
var fairy = require('..');
var fixtures = require('./fixtures');
var expectations = require('./expectations');
var queue = require('queue-async');

test('valid bundles', function(t) {
  var q = queue();

  Object.keys(fixtures.valid).forEach(function(k) {
    q.defer(function(callback) {
      fairy.isbundle(fixtures.valid[k], function(err, output) {
        if (err) throw err;
        t.true(output, k + ': isbundle returned "' + output + '"');
        callback();
      });
    });
  });

  q.await(function(err) {
    if (err) throw err;
    t.end();
  });
});

test('invalid bundles', function(t) {
  var q = queue();

  Object.keys(fixtures.invalid).forEach(function(k) {
    q.defer(function(callback) {
      fairy.isbundle(fixtures.invalid[k], function(err, output) {
        if (err) t.equal(err.message, expectations.invalid[k], 'expected error message');
        t.false(output, k + ': isbundle returned "' + output + '"');
        callback();
      });
    });
  });

  q.await(function(err) {
    if (err) throw err;
    t.end();
  });
});
