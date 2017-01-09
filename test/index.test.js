var test = require('tape');
var fairy = require('..');
var fixtures = require('./fixtures');
var expectations = require('./expectations');
var queue = require('queue-async');
var rimraf = require('rimraf');

test('valid bundles', function(t) {
  var q = queue();

  Object.keys(fixtures.valid).forEach(function(k) {
    q.defer(function(callback) {
      fairy.isbundle(fixtures.valid[k], function(err, output) {
        console.log(err);
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
  fairy.isbundle(fixtures.invalid['einvalid'], function(err) {
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

    cleanup(layers);

    function cleanup(layers) {
      var parts = layers[0].split('/');
      var tmp = parts[parts.indexOf('fixtures') + 1];
      var tmpdir = layers[0].split(tmp)[0] + tmp;

      rimraf(tmpdir, function(err) {
        if (err) throw err;
        t.end();
      });
    }
  });
});

test('extract: single geojson layer', function(t) {
  fairy.extract(fixtures.valid.single_geojson_with_metadata, function(err, output) {
    if (err) throw err;

    var layers = output.split(',');
    t.equal(layers.length, 1, 'expected number of layers');
    t.true(output.indexOf('bundle_single-geojson-with-metadata-without-index/states-1.geojson') > -1, 'outputs expected layer(s)');

    cleanup(layers);

    function cleanup(layers) {
      var parts = layers[0].split('/');
      var tmp = parts[parts.indexOf('fixtures') + 1];
      var tmpdir = layers[0].split(tmp)[0] + tmp;

      rimraf(tmpdir, function(err) {
        if (err) throw err;
        t.end();
      });
    }
  });
});

test('extract: multiple geojson layers', function(t) {
  fairy.extract(fixtures.valid.geojson_withindex_withmetadata, function(err, output) {
    if (err) throw err;

    var layers = output.split(',');
    t.equal(layers.length, 2, 'expected number of layers');
    t.true(output.indexOf('bundle_geojson-with-indices-and-metadata/states-1.geojson') > -1, 'outputs expected layer(s)');

    cleanup(layers);

    function cleanup(layers) {
      var parts = layers[0].split('/');
      var tmp = parts[parts.indexOf('fixtures') + 1];
      var tmpdir = layers[0].split(tmp)[0] + tmp;

      rimraf(tmpdir, function(err) {
        if (err) throw err;
        t.end();
      });
    }
  });
});
