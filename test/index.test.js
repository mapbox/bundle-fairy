var test = require('tape');
var fairy = require('..');
var fixtures = require('./fixtures');
var expectations = require('./expectations');
var queue = require('queue-async');
var rimraf = require('rimraf');
var exec = require('child_process').exec;

function cleanup(layers, assert) {
  var parts = layers[0].split('/');
  var tmp = parts[parts.indexOf('fixtures') + 1];
  var tmpdir = layers[0].split(tmp)[0] + tmp;

  rimraf(tmpdir, function(err) {
    if (err) throw err;
    assert.end();
  });
}

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

test('invalid: proper exit code', function(t) {
  fairy.isbundle(fixtures.invalid['einvalid'], function(err, waka) {
    if (err) t.equal(err.message, 'Invalid zipfile', 'expected error message');
    t.equal(err.code, 'EINVALID', 'expected error code');
    t.end();
  });
});

test('extract: single csv layer', function(t) {
  fairy.extract(fixtures.valid.single_csv_withindex, function(err, output) {
    if (err) throw err;

    var layers = output.split(',');
    t.equal(layers.length, 1, 'expected number of layers');
    t.true(output.indexOf('bundle_single-csv-with-index/states.sm.csv') > -1, 'outputs expected layer(s)');

    cleanup(layers, t);
  });
});

test('extract: single geojson layer', function(t) {
  fairy.extract(fixtures.valid.single_geojson_with_metadata, function(err, output) {
    if (err) throw err;

    var layers = output.split(',');
    t.equal(layers.length, 1, 'expected number of layers');
    t.true(output.indexOf('bundle_single-geojson-with-metadata-without-index/states-1.geojson') > -1, 'outputs expected layer(s)');

    cleanup(layers, t);
  });
});

test('extract: multiple geojson layers', function(t) {
  fairy.extract(fixtures.valid.geojson_withindex_withmetadata, function(err, output) {
    if (err) throw err;

    var layers = output.split(',');
    t.equal(layers.length, 2, 'expected number of layers');
    t.true(output.indexOf('bundle_geojson-with-indices-and-metadata/states-1.geojson') > -1, 'outputs expected layer(s)');

    cleanup(layers, t);
  });
});

test('extract: options.dirname', function(t) {
  fairy.extract(fixtures.valid.single_csv_withindex, { dirname: true }, function(err, output) {
    if (err) throw err;
    t.ok(output.length > 0, 'output has length');
    t.ok(output.indexOf('fixtures') > -1, 'output has fixtures in path');
    t.ok(output.indexOf('/') === 0, 'absolute path');
    rimraf(output, function(err) {
      if (err) throw err;
      t.end();
    });
  });
});

test('[bin] isBundle', function(t) {
  var path = fixtures.valid.geojson_withindex_withmetadata;
  exec('node ' + __dirname + '/../bin/bundle-fairy isBundle ' + path, function(err, stdout, stderr) {
    if (err) t.fail();
    t.equal(stderr, '', 'no stderr');
    t.equal(stdout, 'true\n', 'stdout is true');
    t.end();
  });
});

test('[bin] extract', function(t) {
  var path = fixtures.valid.geojson_withindex_withmetadata;
  exec('node ' + __dirname + '/../bin/bundle-fairy extract ' + path, function(err, stdout, stderr) {
    if (err) t.fail();

    var layers = stdout.split(',');
    t.equal(layers.length, 2, 'expected number of layers');
    t.equal(stderr, '', 'no stderr');
    t.ok(stdout.length > 0, 'stdout has length');
    t.ok(stdout.indexOf(',') > -1, 'stdout has commas');

    cleanup(layers, t);
  });
});

test('[bin] extract --dirname flag', function(t) {
  var path = fixtures.valid.geojson_withindex_withmetadata;
  exec('node ' + __dirname + '/../bin/bundle-fairy extract ' + path + ' --d', function(err, stdout, stderr) {
    if (err) t.fail();
    t.equal(stderr, '', 'no stderr');
    t.ok(stdout.length > 0, 'stdout has length');
    t.ok(stdout.indexOf(',') === -1, 'stdout has no commas');
    t.ok(stdout.indexOf('fixtures') > -1);
    rimraf(stdout.replace('\n', ''), function(err) {
      if (err) throw err;
      t.end();
    });
  });
});
