var util = require('util');
var fs = require('fs');
var path = require('path');
var zip = require('zipfile');

module.exports.isbundle = isbundle;
module.exports.extract = extract;

function isbundle(zipfile, callback) {

  /*
  Assumptions:
  * must have metadata.json if there are several files of same type (geojson or csv)
  * may have indicies (small files don't get indices)
  * csv or geojson, but a bundle must contain just one type
  * maybe flat or have max 1 directory

  metadata.json
  layer1.geojson
  layer2.geojson

  metadata.json
  layer1.csv
  layer1.csv.index
  layer2.csv
  layer2.csv.index

  430bc2fe1cf6903d/
  430bc2fe1cf6903d/metadata.json
  430bc2fe1cf6903d/layer1.geojson
  430bc2fe1cf6903d/layer1.geojson.index
  430bc2fe1cf6903d/layer2.geojson
  430bc2fe1cf6903d/layer2.geojson.index
   */

  var allowed_files = ['.geojson', '.csv', '.index', '.json'];

  iszip(zipfile, function(err) {
    if (err) { return callback(err); }

    try {
      var zf = new zip.ZipFile(zipfile);
    }
    catch (err) {
      return callback(new Error('Invalid zipfile'));
    }

    //empty zip
    if (zf.count === 0) {
      return callback(null, false);
    }

    var directory_cnt = get_root_dir_count(zf.names);
    //only one root directory allowed
    if (directory_cnt > 1) {
      return callback(null, false);
    }

    var diretory_levels = get_max_directory_levels(zf.names);
    //zero or one directory levels allowed
    if (diretory_levels > 1) {
      return callback(null, false);
    }

    //remove directory entry from zf.names
    var file_names = zf.names.filter(function(fname) {
      // var parsed = path.parse(fname);
      // return parsed.base !== parsed.name;
      //return path.basename(fname) !== path.dirname(fname);
      return path.extname(fname) !== '';
    });

    //no bundle: just a single file
    if (file_names < 2) {
      return callback(null, false);
    }

    //remove directory names for each query of 'metadata.json';
    file_names = file_names.map(function(name) { return name.substring(name.indexOf('/') + 1) });

    var has_metadata = file_names.indexOf('metadata.json') > -1;

    //get extensions
    var extensions = file_names.map(function(name) { return path.extname(name) });

    //flatten to unique extensions
    var unique_extensions = extensions.filter(function(item, i, ar) { return ar.indexOf(item) === i; });

    //check, if there are other (unsupported) file type, e.g. shape file
    var not_allowed = false;
    unique_extensions.forEach(function(extension) {
      if (allowed_files.indexOf(extension) < 0) {
        not_allowed = true;
      }
    });
    if (not_allowed) {
      return callback(null, false);
    }

    //no bundle: no geojson OR csv included, maybe faulty file with just '.index' and/or 'metadata.json'
    if (unique_extensions.indexOf('.geojson') < 0 && unique_extensions.indexOf('.csv') < 0) {
      return callback(null, false);
    }

    //no bundle: geojson AND csv included
    if (unique_extensions.indexOf('.geojson') !== -1 && unique_extensions.indexOf('.csv') !== -1) {
      return callback(null, false);
    }

    var file_type_cnt = file_names.reduce(function(count_map, file_name) {
      var ext = path.extname(file_name);
      count_map[ext] = ++count_map[ext] || 1;
      return count_map;
    }, {});

    //no bundle: multiple csv files
    if (file_type_cnt['.csv'] > 1) {
      return callback(null, false);
    }

    //no bundle: converted from gpx/kml (1 to n geojsons) and doesn't have metadata.json file
    if (!has_metadata && unique_extensions.indexOf('.geojson') > -1) {
      return callback(null, false);
    }

    /////bundles start here

    //bundle: converted from gpx/kml (1 to n geojsons) and has metadata.json file
    if (has_metadata && unique_extensions.indexOf('.geojson') > -1) {
      return callback(null, true);
    }

    var has_index = unique_extensions.indexOf('.index');

    //bundle: exactly one csv including index
    if (file_type_cnt['.csv'] === 1 && has_index) {
      return callback(null, true);
    }

    //default to false
    return callback(null, false);
  });
}

function extract(zipfile, callback) {
  console.log('extracting bundle: not implemented');
  callback(null, true, '/home/bergw/xyz/');
}

function get_root_dir_count(entry_names) {
  if (entry_names[0].indexOf('/') < 0) { return 0; }
  var dir_names = entry_names.map(function(entry_name) { return entry_name.substring(0, entry_name.indexOf('/')); });
  dir_names = dir_names.filter(function(item, i, ar) { return ar.indexOf(item) === i; });
  return dir_names.length;
}

function get_max_directory_levels(entry_names) {
  if (entry_names[0].indexOf('/') < 0) { return 0; }
  var max_depth = 0;
  entry_names.forEach(function(entry_name) {
    max_depth = Math.max(max_depth, (entry_name.match(/\//g) || []).length);
  });
  return max_depth;
}

function iszip(zipfile, callback) {
  fs.open(zipfile, 'r', function(err, fd) {
    if (err) { throw err; }
    var buf = new Buffer(2);
    fs.read(fd, buf, 0, 2, 0, function(err, bytes_read, data) {
      if (err) { return callback(err); }
      fs.close(fd, function(err) {
        if (err) return callback(err);
        data = data.toString();
        if (data !== 'PK') { return callback(new Error('Invalid zipfile')); }
        return callback();
      });
    });
  });


}