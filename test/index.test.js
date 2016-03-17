var test = require('tape');
var path = require('path');
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var fairy = require('..');

var fixtures = fs.readdirSync(path.join(__dirname, 'fixtures'))
  .map(function(fixture) { return path.resolve(__dirname, 'fixtures', fixture); });

fixtures.forEach(function(fixture) {
  test(path.basename(fixture), function(t) {
    fairy.isbundle(fixture, function(err, result) {
      var isBundle = path.basename(fixture).split('_')[0] === 'bundle';
      t.error(err);
      t.equal(result, isBundle);
      t.end();
    });
  });
});

